import postgres from "postgres";
import { env, hasDatabaseEnv } from "@/lib/env";

export type PhotoSessionRecord = {
  id: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  layout: string;
  customization: Record<string, unknown>;
  cloudinaryAssets: Array<Record<string, unknown>>;
  sourcePhotoAssets: Array<Record<string, unknown>>;
  finalAssetUrl: string;
  finalAssetPublicId: string;
  gifAssetUrl?: string | null;
  gifAssetPublicId?: string | null;
  email?: string | null;
  emailStatus: "idle" | "sending" | "sent" | "failed";
  emailSentAt?: string | null;
  lastEmailError?: string | null;
};

export type CreatePhotoSessionRecordInput = Omit<
  PhotoSessionRecord,
  "id" | "createdAt"
>;

const memorySessions = new Map<string, PhotoSessionRecord>();

type JsonValue = Parameters<NonNullable<ReturnType<typeof getSql>>["json"]>[0];

function asJson(value: unknown) {
  return value as JsonValue;
}

function getSql() {
  if (!hasDatabaseEnv || !env.DATABASE_URL) return null;
  return postgres(env.DATABASE_URL, { max: 1, prepare: false });
}

function toRecord(row: Record<string, unknown>): PhotoSessionRecord {
  return {
    id: String(row.id),
    token: String(row.token),
    createdAt: new Date(String(row.created_at)).toISOString(),
    expiresAt: new Date(String(row.expires_at)).toISOString(),
    layout: String(row.layout),
    customization: (row.customization_json as Record<string, unknown>) ?? {},
    cloudinaryAssets:
      (row.cloudinary_assets_json as Array<Record<string, unknown>>) ?? [],
    sourcePhotoAssets:
      (row.source_photo_assets_json as Array<Record<string, unknown>>) ?? [],
    finalAssetUrl: String(row.final_asset_url),
    finalAssetPublicId: String(row.final_asset_public_id),
    gifAssetUrl: row.gif_asset_url ? String(row.gif_asset_url) : null,
    gifAssetPublicId: row.gif_asset_public_id
      ? String(row.gif_asset_public_id)
      : null,
    email: row.email ? String(row.email) : null,
    emailStatus: String(row.email_status) as PhotoSessionRecord["emailStatus"],
    emailSentAt: row.email_sent_at
      ? new Date(String(row.email_sent_at)).toISOString()
      : null,
    lastEmailError: row.last_email_error ? String(row.last_email_error) : null,
  };
}

export async function createPhotoSession(
  input: CreatePhotoSessionRecordInput,
): Promise<PhotoSessionRecord> {
  const sql = getSql();
  const now = new Date().toISOString();

  if (!sql) {
    const record: PhotoSessionRecord = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
    };
    memorySessions.set(record.token, record);
    return record;
  }

  const rows = await sql`
    insert into photo_sessions (
      token,
      expires_at,
      layout,
      customization_json,
      cloudinary_assets_json,
      source_photo_assets_json,
      final_asset_url,
      final_asset_public_id,
      gif_asset_url,
      gif_asset_public_id,
      email,
      email_status
    ) values (
      ${input.token},
      ${input.expiresAt},
      ${input.layout},
      ${sql.json(asJson(input.customization))},
      ${sql.json(asJson(input.cloudinaryAssets))},
      ${sql.json(asJson(input.sourcePhotoAssets))},
      ${input.finalAssetUrl},
      ${input.finalAssetPublicId},
      ${input.gifAssetUrl ?? null},
      ${input.gifAssetPublicId ?? null},
      ${input.email ?? null},
      ${input.emailStatus}
    )
    returning *
  `;

  await sql.end();
  return toRecord(rows[0]);
}

export async function getPhotoSessionByToken(
  token: string,
): Promise<PhotoSessionRecord | null> {
  const sql = getSql();

  if (!sql) {
    return memorySessions.get(token) ?? null;
  }

  const rows = await sql`
    select *
    from photo_sessions
    where token = ${token}
    limit 1
  `;
  await sql.end();
  return rows[0] ? toRecord(rows[0]) : null;
}

export async function markEmailSent(token: string, email: string) {
  const sql = getSql();
  const sentAt = new Date().toISOString();

  if (!sql) {
    const record = memorySessions.get(token);
    if (record) {
      memorySessions.set(token, {
        ...record,
        email,
        emailStatus: "sent",
        emailSentAt: sentAt,
      });
    }
    return;
  }

  await sql`
    update photo_sessions
    set email = ${email}, email_status = 'sent', email_sent_at = ${sentAt}
    where token = ${token}
  `;
  await sql.end();
}

export async function markEmailFailed(
  token: string,
  email: string,
  message: string,
) {
  const sql = getSql();

  if (!sql) {
    const record = memorySessions.get(token);
    if (record) {
      memorySessions.set(token, {
        ...record,
        email,
        emailStatus: "failed",
        lastEmailError: message,
      });
    }
    return;
  }

  await sql`
    update photo_sessions
    set email = ${email}, email_status = 'failed', last_email_error = ${message}
    where token = ${token}
  `;
  await sql.end();
}

export function isSessionExpired(
  session: Pick<PhotoSessionRecord, "expiresAt">,
) {
  return new Date(session.expiresAt).getTime() <= Date.now();
}

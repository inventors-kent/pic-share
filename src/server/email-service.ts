import { Resend } from "resend";
import { env, hasEmailEnv } from "@/lib/env";
import type { PhotoSessionRecord } from "./session-repository";

const resend =
  hasEmailEnv && env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendPhotoSessionEmail(
  session: PhotoSessionRecord,
  email: string,
) {
  if (!resend || !env.RESEND_FROM_EMAIL) {
    return { provider: "mock" as const, id: `mock_${crypto.randomUUID()}` };
  }

  const shareUrl = `${env.APP_BASE_URL}/s/${session.token}`;
  const result = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: email,
    subject: "Your PicShare Booth photos are ready",
    html: `
      <div style="font-family: system-ui, sans-serif; color: #313131;">
        <h1>Your booth moment is ready</h1>
        <p>Open your private download page here:</p>
        <p><a href="${shareUrl}">${shareUrl}</a></p>
        <p>This link expires on ${new Date(session.expiresAt).toLocaleString()}.</p>
      </div>
    `,
  });

  return { provider: "resend" as const, id: result.data?.id };
}

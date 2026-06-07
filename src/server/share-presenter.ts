import { env } from "@/lib/env";
import type { PhotoSessionRecord } from "./session-repository";

export function presentShareSession(session: PhotoSessionRecord) {
  return {
    token: session.token,
    shareUrl: `${env.APP_BASE_URL}/s/${session.token}`,
    expiresAt: session.expiresAt,
    layout: session.layout,
    finalAssetUrl: session.finalAssetUrl,
    gifAssetUrl: session.gifAssetUrl,
    sourcePhotoAssets: session.sourcePhotoAssets,
    emailStatus: session.emailStatus,
  };
}

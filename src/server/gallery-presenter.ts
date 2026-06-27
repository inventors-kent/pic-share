import type { GalleryItem } from "@/lib/gallery";
import type { PhotoSessionRecord } from "@/server/session-repository";

export function presentGalleryItem(session: PhotoSessionRecord): GalleryItem {
  return {
    id: session.token,
    assetUrl: session.gifAssetUrl ?? session.finalAssetUrl,
    createdAt: session.createdAt,
    layout: session.layout,
    isGif: Boolean(session.gifAssetUrl),
    caption:
      typeof session.customization.caption === "string"
        ? session.customization.caption
        : "",
    accentColor:
      typeof session.customization.accentColor === "string"
        ? session.customization.accentColor
        : "coral",
  };
}

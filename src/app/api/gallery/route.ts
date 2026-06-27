import { presentGalleryItem } from "@/server/gallery-presenter";
import { listGalleryPhotoSessions } from "@/server/session-repository";

export async function GET() {
  try {
    const sessions = await listGalleryPhotoSessions();
    return Response.json({ items: sessions.map(presentGalleryItem) });
  } catch (error) {
    console.error("Failed to load gallery", error);
    return Response.json(
      { error: "The gallery could not be loaded." },
      { status: 500 },
    );
  }
}

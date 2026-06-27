import type { Metadata } from "next";
import { connection } from "next/server";
import { GalleryWall } from "@/components/gallery/gallery-wall";
import { presentGalleryItem } from "@/server/gallery-presenter";
import { listGalleryPhotoSessions } from "@/server/session-repository";

export const metadata: Metadata = {
  title: "Runway Wall | PicShare Booth",
  description: "Photos and GIFs from the KSF Fashion Show booth.",
};

export default async function GalleryPage() {
  await connection();

  try {
    const sessions = await listGalleryPhotoSessions();
    return <GalleryWall initialItems={sessions.map(presentGalleryItem)} />;
  } catch (error) {
    console.error("Failed to render gallery", error);
    return <GalleryWall initialItems={[]} />;
  }
}

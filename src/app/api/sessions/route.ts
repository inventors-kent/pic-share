import { env, hasCloudinaryEnv } from "@/lib/env";
import { createSessionSchema } from "@/lib/share-schema";
import { uploadBoothAsset } from "@/server/media-service";
import { createPhotoSession } from "@/server/session-repository";
import { presentShareSession } from "@/server/share-presenter";

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === "production" && !hasCloudinaryEnv) {
      return Response.json(
        {
          error:
            "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const parsed = createSessionSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid session payload." },
        { status: 400 },
      );
    }

    const token = crypto.randomUUID().replaceAll("-", "");
    const expiresAt = new Date(
      Date.now() + env.SHARE_LINK_EXPIRY_HOURS * 60 * 60 * 1000,
    ).toISOString();

    const finalAsset = await uploadBoothAsset(parsed.data.finalAssetDataUrl);
    const gifAsset = parsed.data.gifAssetDataUrl
      ? await uploadBoothAsset(parsed.data.gifAssetDataUrl)
      : null;

    const sourceAssets = await Promise.all(
      parsed.data.sourcePhotoDataUrls.map((dataUrl) =>
        uploadBoothAsset(dataUrl, "picshare-booth/source"),
      ),
    );

    const session = await createPhotoSession({
      token,
      expiresAt,
      layout: parsed.data.layout,
      customization: parsed.data.customization,
      cloudinaryAssets: [finalAsset, ...(gifAsset ? [gifAsset] : [])],
      sourcePhotoAssets: sourceAssets,
      finalAssetUrl: finalAsset.url,
      finalAssetPublicId: finalAsset.publicId,
      gifAssetUrl: gifAsset?.url,
      gifAssetPublicId: gifAsset?.publicId,
      email: parsed.data.email || null,
      emailStatus: "idle",
    });

    return Response.json(presentShareSession(session), { status: 201 });
  } catch (error) {
    console.error("Failed to create photo session", error);
    return Response.json(
      { error: "The photo session could not be created." },
      { status: 500 },
    );
  }
}

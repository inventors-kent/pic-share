import { v2 as cloudinary } from "cloudinary";
import { env, hasCloudinaryEnv } from "@/lib/env";

export type UploadedAsset = {
  url: string;
  publicId: string;
  provider: "cloudinary" | "mock";
};

if (hasCloudinaryEnv) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadBoothAsset(
  dataUrl: string,
  folder = "picshare-booth",
): Promise<UploadedAsset> {
  if (!hasCloudinaryEnv) {
    return {
      url: dataUrl,
      publicId: `mock_${crypto.randomUUID()}`,
      provider: "mock",
    };
  }

  const result = await cloudinary.uploader.upload(dataUrl, {
    folder,
    resource_type: "auto",
    overwrite: false,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    provider: "cloudinary",
  };
}

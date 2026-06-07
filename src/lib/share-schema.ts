import { z } from "zod";

export const createSessionSchema = z.object({
  finalAssetDataUrl: z.string().min(1),
  gifAssetDataUrl: z.string().optional(),
  sourcePhotoDataUrls: z.array(z.string().min(1)).default([]),
  layout: z.string().min(1),
  customization: z.record(z.string(), z.unknown()),
  email: z.email().optional().or(z.literal("")),
});

export const sendEmailSchema = z.object({
  email: z.email(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

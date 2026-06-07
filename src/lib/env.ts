import { z } from "zod";

const envSchema = z.object({
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  SHARE_LINK_EXPIRY_HOURS: z.coerce.number().int().positive().default(24),
});

export const env = envSchema.parse({
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  DATABASE_URL: process.env.DATABASE_URL,
  APP_BASE_URL: process.env.APP_BASE_URL || "http://localhost:3000",
  SHARE_LINK_EXPIRY_HOURS: process.env.SHARE_LINK_EXPIRY_HOURS,
});

export const hasCloudinaryEnv = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET,
);

export const hasEmailEnv = Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL);
export const hasDatabaseEnv = Boolean(env.DATABASE_URL);

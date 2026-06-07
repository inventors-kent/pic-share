export const boothConfig = {
  productName: "PicShare Booth",
  eventName: "KSF Fashion show",
  photoCount: 4,
  countdownSeconds: 3,
  shareLinkExpiryHours: Number(process.env.SHARE_LINK_EXPIRY_HOURS ?? 24),
  mirrorPreview: true,
  mirrorOutput: false,
  resetAfterMs: 120_000,
  stickerPresets: [
    { id: "sparkles", label: "Sparkles" },
    { id: "stars", label: "Party stars" },
    { id: "hearts", label: "Tiny hearts" },
    { id: "good-vibes", label: "Good vibes" },
    { id: "event-badge", label: "Event badge" },
  ],
  accentColors: [
    { id: "coral", label: "Coral", value: "#ff6b5f" },
    { id: "mint", label: "Mint", value: "#8ee6c8" },
    { id: "lemon", label: "Lemon", value: "#ffd66b" },
    { id: "lilac", label: "Lilac", value: "#b9a8ff" },
    { id: "sky", label: "Sky", value: "#8fd4ff" },
  ],
} as const;

export type StickerPresetId = (typeof boothConfig.stickerPresets)[number]["id"];
export type AccentColorId = (typeof boothConfig.accentColors)[number]["id"];

export type BoothLayout =
  | "grid"
  | "vertical-strip"
  | "horizontal-strip"
  | "gif";
export type FrameStyle = "clean" | "rounded" | "instant" | "confetti";
export type GifSpeed = "slow" | "normal" | "fast";

export const layoutOptions: Array<{ id: BoothLayout; label: string }> = [
  { id: "grid", label: "2x2 grid" },
  { id: "vertical-strip", label: "Vertical strip" },
  { id: "horizontal-strip", label: "Horizontal strip" },
  { id: "gif", label: "GIF" },
];

export const frameOptions: Array<{ id: FrameStyle; label: string }> = [
  { id: "clean", label: "Clean" },
  { id: "rounded", label: "Rounded color" },
  { id: "instant", label: "Instant film" },
  { id: "confetti", label: "Confetti" },
];

import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "var(--font-onest), system-ui, sans-serif" },
        body: { value: "var(--font-onest), system-ui, sans-serif" },
      },
      colors: {
        booth: {
          ink: { value: "#182026" },
          coral: { value: "#ff6b5f" },
          lemon: { value: "#ffd66b" },
          mint: { value: "#8ee6c8" },
          lilac: { value: "#b9a8ff" },
          sky: { value: "#8fd4ff" },
          cream: { value: "#fff8ed" },
          paper: { value: "#ffffff" },
          blush: { value: "#fff0ed" },
        },
      },
      radii: {
        booth: { value: "28px" },
        control: { value: "18px" },
      },
      shadows: {
        booth: { value: "0 24px 70px rgba(24, 32, 38, 0.14)" },
        button: { value: "0 12px 28px rgba(255, 107, 95, 0.32)" },
      },
    },
    semanticTokens: {
      colors: {
        "booth.bg": { value: "{colors.booth.cream}" },
        "booth.fg": { value: "{colors.booth.ink}" },
        "booth.muted": { value: "#667078" },
        "booth.surface": { value: "{colors.booth.paper}" },
        "booth.surfaceTint": { value: "{colors.booth.blush}" },
        "booth.primary": { value: "{colors.booth.coral}" },
        "booth.secondary": { value: "{colors.booth.mint}" },
        "booth.border": { value: "rgba(24, 32, 38, 0.12)" },
      },
    },
  },
  globalCss: {
    html: {
      colorPalette: "coral",
    },
    body: {
      bg: "booth.bg",
      color: "booth.fg",
      minH: "100dvh",
    },
    "*::selection": {
      bg: "booth.lemon",
      color: "booth.ink",
    },
  },
});

export const boothSystem = createSystem(defaultConfig, config);

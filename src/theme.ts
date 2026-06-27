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
          ink: { value: "#313131" },
          coral: { value: "#EE5B54" },
          yellow: { value: "#FFDE39" },
          teal: { value: "#009688" },
          navy: { value: "#18364A" },
          sky: { value: "#03A9F4" },
          cream: { value: "#FFFAFA" },
          paper: { value: "#FFFFFF" },
          blush: { value: "#FFF1F0" },
        },
      },
      radii: {
        booth: { value: "28px" },
        control: { value: "18px" },
      },
      shadows: {
        booth: { value: "0 24px 70px rgba(49, 49, 49, 0.14)" },
        button: { value: "0 12px 28px rgba(238, 91, 84, 0.3)" },
      },
    },
    semanticTokens: {
      colors: {
        "booth.bg": { value: "{colors.booth.cream}" },
        "booth.fg": { value: "{colors.booth.ink}" },
        "booth.muted": { value: "#626262" },
        "booth.surface": { value: "{colors.booth.paper}" },
        "booth.surfaceTint": { value: "{colors.booth.blush}" },
        "booth.primary": { value: "{colors.booth.coral}" },
        "booth.secondary": { value: "{colors.booth.teal}" },
        "booth.border": { value: "rgba(49, 49, 49, 0.14)" },
      },
    },
    keyframes: {
      "booth-drift": {
        "0%, 100%": { transform: "translateY(0) rotate(-2deg)" },
        "50%": { transform: "translateY(-12px) rotate(2deg)" },
      },
      "booth-fill": {
        "0%": { transform: "scaleX(0.14)" },
        "45%": { transform: "scaleX(0.64)" },
        "100%": { transform: "scaleX(1)" },
      },
      "booth-scan": {
        "0%": { transform: "translateX(-120%)" },
        "100%": { transform: "translateX(120%)" },
      },
      "booth-tick": {
        "0%, 100%": { opacity: "0.55", transform: "scale(0.96)" },
        "50%": { opacity: "1", transform: "scale(1.04)" },
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
      bg: "booth.yellow",
      color: "booth.ink",
    },
  },
});

export const boothSystem = createSystem(defaultConfig, config);

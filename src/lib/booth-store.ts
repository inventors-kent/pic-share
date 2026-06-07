"use client";

import { create } from "zustand";
import type {
  AccentColorId,
  BoothLayout,
  FrameStyle,
  GifSpeed,
  StickerPresetId,
} from "./booth-config";
import { boothConfig } from "./booth-config";

export type BoothStep =
  | "start"
  | "camera"
  | "review"
  | "customize"
  | "generating"
  | "share"
  | "error";

export type CapturedPhoto = {
  id: string;
  dataUrl: string;
  createdAt: number;
};

export type BoothCustomization = {
  layout: BoothLayout;
  frame: FrameStyle;
  accentColor: AccentColorId;
  stickerPreset: StickerPresetId;
  caption: string;
  gifSpeed: GifSpeed;
};

export type ShareResult = {
  token: string;
  shareUrl: string;
  expiresAt: string;
  finalAssetUrl: string;
  gifAssetUrl?: string;
  emailStatus?: "idle" | "sending" | "sent" | "failed";
};

type BoothState = {
  step: BoothStep;
  photos: CapturedPhoto[];
  retakeIndex: number | null;
  customization: BoothCustomization;
  generatedDataUrl: string | null;
  shareResult: ShareResult | null;
  errorMessage: string | null;
  setStep: (step: BoothStep) => void;
  addPhoto: (photo: CapturedPhoto) => void;
  replacePhoto: (index: number, photo: CapturedPhoto) => void;
  setRetakeIndex: (index: number | null) => void;
  updateCustomization: (patch: Partial<BoothCustomization>) => void;
  setGeneratedDataUrl: (dataUrl: string | null) => void;
  setShareResult: (result: ShareResult | null) => void;
  setEmailStatus: (status: ShareResult["emailStatus"]) => void;
  setError: (message: string) => void;
  reset: () => void;
};

const defaultCustomization: BoothCustomization = {
  layout: "grid",
  frame: "rounded",
  accentColor: "coral",
  stickerPreset: "sparkles",
  caption: "",
  gifSpeed: "normal",
};

export const useBoothStore = create<BoothState>((set) => ({
  step: "start",
  photos: [],
  retakeIndex: null,
  customization: defaultCustomization,
  generatedDataUrl: null,
  shareResult: null,
  errorMessage: null,
  setStep: (step) => set({ step, errorMessage: null }),
  addPhoto: (photo) =>
    set((state) => ({
      photos: [...state.photos, photo].slice(0, boothConfig.photoCount),
    })),
  replacePhoto: (index, photo) =>
    set((state) => ({
      photos: state.photos.map((item, itemIndex) =>
        itemIndex === index ? photo : item,
      ),
      retakeIndex: null,
    })),
  setRetakeIndex: (retakeIndex) => set({ retakeIndex }),
  updateCustomization: (patch) =>
    set((state) => ({
      customization: { ...state.customization, ...patch },
    })),
  setGeneratedDataUrl: (generatedDataUrl) => set({ generatedDataUrl }),
  setShareResult: (shareResult) => set({ shareResult }),
  setEmailStatus: (emailStatus) =>
    set((state) => ({
      shareResult: state.shareResult
        ? { ...state.shareResult, emailStatus }
        : state.shareResult,
    })),
  setError: (errorMessage) => set({ step: "error", errorMessage }),
  reset: () =>
    set({
      step: "start",
      photos: [],
      retakeIndex: null,
      customization: defaultCustomization,
      generatedDataUrl: null,
      shareResult: null,
      errorMessage: null,
    }),
}));

import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { type BoothLayout, boothConfig } from "./booth-config";
import type { BoothCustomization, CapturedPhoto } from "./booth-store";

type ComposeResult = {
  dataUrl: string;
  width: number;
  height: number;
};

const accentMap = new Map(
  boothConfig.accentColors.map((color) => [color.id, color.value]),
);

const layoutSize: Record<BoothLayout, { width: number; height: number }> = {
  grid: { width: 1400, height: 1400 },
  "vertical-strip": { width: 900, height: 1800 },
  "horizontal-strip": { width: 1800, height: 900 },
  gif: { width: 1200, height: 1200 },
};

const gifDelayMs = {
  slow: 850,
  normal: 520,
  fast: 280,
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.closePath();
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const ratio = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * ratio;
  const drawHeight = image.height * ratio;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function getSlots(layout: BoothLayout, width: number, height: number) {
  const pad = layout === "grid" ? 92 : 76;
  const gutter = 32;

  if (layout === "vertical-strip") {
    const slotHeight = (height - pad * 2 - gutter * 3 - 160) / 4;
    return Array.from({ length: 4 }, (_, index) => ({
      x: pad,
      y: pad + index * (slotHeight + gutter),
      width: width - pad * 2,
      height: slotHeight,
    }));
  }

  if (layout === "horizontal-strip") {
    const slotWidth = (width - pad * 2 - gutter * 3) / 4;
    return Array.from({ length: 4 }, (_, index) => ({
      x: pad + index * (slotWidth + gutter),
      y: pad,
      width: slotWidth,
      height: height - pad * 2 - 128,
    }));
  }

  const slotSize = (width - pad * 2 - gutter) / 2;
  return Array.from({ length: 4 }, (_, index) => ({
    x: pad + (index % 2) * (slotSize + gutter),
    y: pad + Math.floor(index / 2) * (slotSize + gutter),
    width: slotSize,
    height: slotSize,
  }));
}

function drawStickerPreset(
  context: CanvasRenderingContext2D,
  customization: BoothCustomization,
  width: number,
  height: number,
) {
  const accent = accentMap.get(customization.accentColor) ?? "#ff6b5f";
  context.save();
  context.fillStyle = accent;
  context.strokeStyle = "#182026";
  context.lineWidth = 8;

  if (customization.stickerPreset === "hearts") {
    context.font = "96px sans-serif";
    context.fillText("♥", 56, 130);
    context.fillText("♥", width - 150, height - 70);
  }

  if (customization.stickerPreset === "stars") {
    context.font = "104px sans-serif";
    context.fillText("★", 54, 132);
    context.fillText("★", width - 150, 132);
  }

  if (customization.stickerPreset === "sparkles") {
    context.font = "96px sans-serif";
    context.fillText("✦", 58, 132);
    context.fillText("✧", width - 142, height - 76);
  }

  if (customization.stickerPreset === "good-vibes") {
    context.beginPath();
    context.roundRect(width - 410, height - 150, 330, 82, 42);
    context.fill();
    context.stroke();
    context.fillStyle = "#182026";
    context.font = "700 40px sans-serif";
    context.fillText("good vibes", width - 362, height - 96);
  }

  if (customization.stickerPreset === "event-badge") {
    context.beginPath();
    context.roundRect(54, height - 152, 430, 86, 42);
    context.fill();
    context.stroke();
    context.fillStyle = "#182026";
    context.font = "700 34px sans-serif";
    context.fillText(boothConfig.eventName, 96, height - 98);
  }

  context.restore();
}

export async function composeFinalImage(
  photos: CapturedPhoto[],
  customization: BoothCustomization,
): Promise<ComposeResult> {
  const layout = customization.layout === "gif" ? "grid" : customization.layout;
  const { width, height } = layoutSize[layout];
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is unavailable on this device.");
  }

  canvas.width = width;
  canvas.height = height;

  const accent = accentMap.get(customization.accentColor) ?? "#ff6b5f";
  context.fillStyle = customization.frame === "clean" ? "#ffffff" : accent;
  context.fillRect(0, 0, width, height);

  if (customization.frame === "confetti") {
    for (let index = 0; index < 80; index += 1) {
      context.fillStyle = ["#ffd66b", "#8ee6c8", "#b9a8ff", "#ff6b5f"][
        index % 4
      ];
      context.beginPath();
      context.arc(
        Math.random() * width,
        Math.random() * height,
        6 + Math.random() * 12,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
  }

  const images = await Promise.all(
    photos.map((photo) => loadImage(photo.dataUrl)),
  );
  const slots = getSlots(layout, width, height);

  images.forEach((image, index) => {
    const slot = slots[index];
    if (!slot) return;
    context.save();
    roundedRect(context, slot.x, slot.y, slot.width, slot.height, 34);
    context.clip();
    context.fillStyle = "#ffffff";
    context.fillRect(slot.x, slot.y, slot.width, slot.height);
    drawImageCover(context, image, slot.x, slot.y, slot.width, slot.height);
    context.restore();
  });

  const caption =
    customization.caption.trim() ||
    `${boothConfig.eventName} · ${boothConfig.eventDate}`;

  context.fillStyle = "#182026";
  context.font = "700 44px sans-serif";
  context.textAlign = "center";
  context.fillText(caption, width / 2, height - 54, width - 120);

  drawStickerPreset(context, customization, width, height);

  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.92),
    width,
    height,
  };
}

export async function createGifPreview(
  photos: CapturedPhoto[],
  customization: BoothCustomization,
): Promise<string | undefined> {
  if (photos.length === 0) return undefined;

  const width = 640;
  const height = 640;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Canvas is unavailable on this device.");
  }

  canvas.width = width;
  canvas.height = height;

  const accent = accentMap.get(customization.accentColor) ?? "#ff6b5f";
  const gif = GIFEncoder();
  const images = await Promise.all(
    photos.map((photo) => loadImage(photo.dataUrl)),
  );

  images.forEach((image) => {
    context.clearRect(0, 0, width, height);
    context.fillStyle = customization.frame === "clean" ? "#ffffff" : accent;
    context.fillRect(0, 0, width, height);

    const pad = customization.frame === "instant" ? 66 : 46;
    const bottomPad = customization.frame === "instant" ? 112 : 74;
    const photoBox = {
      x: pad,
      y: pad,
      width: width - pad * 2,
      height: height - pad - bottomPad,
    };

    context.save();
    roundedRect(
      context,
      photoBox.x,
      photoBox.y,
      photoBox.width,
      photoBox.height,
      34,
    );
    context.clip();
    drawImageCover(
      context,
      image,
      photoBox.x,
      photoBox.y,
      photoBox.width,
      photoBox.height,
    );
    context.restore();

    context.fillStyle = "#182026";
    context.font = "700 28px sans-serif";
    context.textAlign = "center";
    context.fillText(
      customization.caption.trim() || boothConfig.eventName,
      width / 2,
      height - 34,
      width - 72,
    );

    drawStickerPreset(context, customization, width, height);

    const { data } = context.getImageData(0, 0, width, height);
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    gif.writeFrame(index, width, height, {
      palette,
      delay: gifDelayMs[customization.gifSpeed],
      repeat: 0,
    });
  });

  gif.finish();

  const bytes = gif.bytes();
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return `data:image/gif;base64,${btoa(binary)}`;
}

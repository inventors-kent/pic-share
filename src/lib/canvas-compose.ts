import { applyPalette, GIFEncoder, quantize } from "gifenc";
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

const confettiColors = ["#ff6b5f", "#8ee6c8", "#ffd66b", "#b9a8ff", "#8fd4ff"];

function seededRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function drawConfettiPattern(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale = 1,
) {
  context.save();

  for (let index = 0; index < 112; index += 1) {
    const edge = index % 4;
    const along = seededRandom(index + 3);
    const inset = 26 * scale + seededRandom(index + 9) * 86 * scale;
    const x =
      edge === 0
        ? along * width
        : edge === 1
          ? width - inset
          : edge === 2
            ? along * width
            : inset;
    const y =
      edge === 0
        ? inset
        : edge === 1
          ? along * height
          : edge === 2
            ? height - inset
            : along * height;
    const rotation = seededRandom(index + 21) * Math.PI;
    const pieceWidth = (10 + seededRandom(index + 31) * 24) * scale;
    const pieceHeight = (5 + seededRandom(index + 41) * 12) * scale;

    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.fillStyle = confettiColors[index % confettiColors.length];

    if (index % 5 === 0) {
      context.beginPath();
      context.moveTo(0, -pieceHeight);
      context.lineTo(pieceWidth, pieceHeight);
      context.lineTo(-pieceWidth, pieceHeight);
      context.closePath();
      context.fill();
    } else if (index % 3 === 0) {
      context.beginPath();
      context.arc(0, 0, pieceHeight, 0, Math.PI * 2);
      context.fill();
    } else {
      context.beginPath();
      context.roundRect(
        -pieceWidth / 2,
        -pieceHeight / 2,
        pieceWidth,
        pieceHeight,
        3 * scale,
      );
      context.fill();
    }

    context.restore();
  }

  for (let index = 0; index < 12; index += 1) {
    const x = seededRandom(index + 101) * width;
    const y =
      index % 2 === 0
        ? 34 * scale + seededRandom(index + 111) * 90 * scale
        : height - 124 * scale + seededRandom(index + 111) * 90 * scale;

    context.strokeStyle = confettiColors[(index + 2) % confettiColors.length];
    context.lineWidth = 7 * scale;
    context.lineCap = "round";
    context.beginPath();

    for (let step = 0; step < 7; step += 1) {
      const waveX = x + step * 24 * scale;
      const waveY = y + Math.sin(step * 1.4 + index) * 18 * scale;
      if (step === 0) {
        context.moveTo(waveX, waveY);
      } else {
        context.lineTo(waveX, waveY);
      }
    }

    context.stroke();
  }

  context.restore();
}

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
    drawConfettiPattern(context, width, height);
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

    if (customization.frame === "confetti") {
      drawConfettiPattern(context, width, height, 0.55);
    }

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
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    "",
  );
  return `data:image/gif;base64,${btoa(binary)}`;
}

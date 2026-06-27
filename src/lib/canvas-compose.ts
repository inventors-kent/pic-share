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

const confettiColors = ["#EE5B54", "#009688", "#FFDE39", "#18364A", "#03A9F4"];

function getFooterHeight(
  layout: BoothLayout,
  frame: BoothCustomization["frame"],
) {
  if (layout === "vertical-strip") return frame === "instant" ? 270 : 230;
  if (layout === "horizontal-strip") return frame === "instant" ? 230 : 190;
  return frame === "instant" ? 190 : 150;
}

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

function getSlots(
  layout: BoothLayout,
  width: number,
  height: number,
  frame: BoothCustomization["frame"],
) {
  const pad = layout === "grid" ? 92 : 76;
  const gutter = 32;
  const footerHeight = getFooterHeight(layout, frame);

  if (layout === "vertical-strip") {
    const slotHeight = (height - pad * 2 - gutter * 3 - footerHeight) / 4;
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
      height: height - pad * 2 - footerHeight,
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

function drawFitText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxFontSize: number,
  minFontSize: number,
  weight = 800,
) {
  let fontSize = maxFontSize;

  while (fontSize > minFontSize) {
    context.font = `${weight} ${fontSize}px sans-serif`;
    if (context.measureText(text).width <= maxWidth) break;
    fontSize -= 2;
  }

  context.fillText(text, x, y);
}

function drawPhotoSlot(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  slot: { x: number; y: number; width: number; height: number },
  frame: BoothCustomization["frame"],
) {
  if (frame === "instant") {
    const filmPad = Math.max(18, Math.round(slot.width * 0.045));
    const filmBottom = Math.max(58, Math.round(slot.height * 0.16));
    const photoBox = {
      x: slot.x + filmPad,
      y: slot.y + filmPad,
      width: slot.width - filmPad * 2,
      height: slot.height - filmPad - filmBottom,
    };

    context.save();
    context.shadowColor = "rgba(24, 32, 38, 0.14)";
    context.shadowBlur = 22;
    context.shadowOffsetY = 12;
    context.fillStyle = "#FFFAFA";
    roundedRect(context, slot.x, slot.y, slot.width, slot.height, 30);
    context.fill();
    context.restore();

    context.save();
    roundedRect(
      context,
      photoBox.x,
      photoBox.y,
      photoBox.width,
      photoBox.height,
      22,
    );
    context.clip();
    context.fillStyle = "#ffffff";
    context.fillRect(photoBox.x, photoBox.y, photoBox.width, photoBox.height);
    drawImageCover(
      context,
      image,
      photoBox.x,
      photoBox.y,
      photoBox.width,
      photoBox.height,
    );
    context.restore();
    return;
  }

  context.save();
  roundedRect(context, slot.x, slot.y, slot.width, slot.height, 34);
  context.clip();
  context.fillStyle = "#ffffff";
  context.fillRect(slot.x, slot.y, slot.width, slot.height);
  drawImageCover(context, image, slot.x, slot.y, slot.width, slot.height);
  context.restore();
}

function drawStickerPreset(
  context: CanvasRenderingContext2D,
  customization: BoothCustomization,
  width: number,
  height: number,
) {
  const accent = accentMap.get(customization.accentColor) ?? "#EE5B54";
  context.save();
  context.fillStyle = accent;
  context.strokeStyle = "#313131";
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

  context.restore();
}

function drawGifStickerPreset(
  context: CanvasRenderingContext2D,
  customization: BoothCustomization,
  photoBox: { x: number; y: number; width: number; height: number },
) {
  const accent = accentMap.get(customization.accentColor) ?? "#EE5B54";

  context.save();
  context.fillStyle = accent;
  context.strokeStyle = "#313131";
  context.lineWidth = 5;

  if (customization.stickerPreset === "hearts") {
    context.font = "56px sans-serif";
    context.fillText("♥", photoBox.x + 24, photoBox.y + 58);
    context.fillText(
      "♥",
      photoBox.x + photoBox.width - 74,
      photoBox.y + photoBox.height - 22,
    );
  }

  if (customization.stickerPreset === "stars") {
    context.font = "58px sans-serif";
    context.fillText("★", photoBox.x + 22, photoBox.y + 60);
    context.fillText("★", photoBox.x + photoBox.width - 76, photoBox.y + 60);
  }

  if (customization.stickerPreset === "sparkles") {
    context.font = "58px sans-serif";
    context.fillText("✦", photoBox.x + 22, photoBox.y + 60);
    context.fillText(
      "✧",
      photoBox.x + photoBox.width - 78,
      photoBox.y + photoBox.height - 24,
    );
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

  const accent = accentMap.get(customization.accentColor) ?? "#EE5B54";
  context.fillStyle =
    customization.frame === "clean"
      ? "#ffffff"
      : customization.frame === "instant"
        ? "#FFFAFA"
        : accent;
  context.fillRect(0, 0, width, height);

  if (customization.frame === "confetti") {
    drawConfettiPattern(context, width, height);
  }

  const images = await Promise.all(
    photos.map((photo) => loadImage(photo.dataUrl)),
  );
  const slots = getSlots(layout, width, height, customization.frame);

  images.forEach((image, index) => {
    const slot = slots[index];
    if (!slot) return;
    drawPhotoSlot(context, image, slot, customization.frame);
  });

  const caption = customization.caption.trim() || boothConfig.eventName;

  context.fillStyle = "#313131";
  context.textAlign = "center";
  drawFitText(context, caption, width / 2, height - 82, width - 160, 44, 28);

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

  const accent = accentMap.get(customization.accentColor) ?? "#EE5B54";
  const gif = GIFEncoder();
  const images = await Promise.all(
    photos.map((photo) => loadImage(photo.dataUrl)),
  );

  images.forEach((image, frameIndex) => {
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

    drawGifStickerPreset(context, customization, photoBox);

    context.fillStyle = "#313131";
    context.textAlign = "left";
    drawFitText(
      context,
      customization.caption.trim() || boothConfig.eventName,
      pad,
      height - 34,
      width - pad * 2 - 124,
      28,
      18,
    );

    const badgeWidth = 98;
    const badgeHeight = 36;
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.roundRect(
      width - pad - badgeWidth,
      height - 58,
      badgeWidth,
      badgeHeight,
      18,
    );
    context.fill();
    context.fillStyle = "#313131";
    context.textAlign = "center";
    context.font = "800 18px sans-serif";
    context.fillText(
      `GIF ${frameIndex + 1} / ${images.length}`,
      width - pad - badgeWidth / 2,
      height - 34,
    );

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

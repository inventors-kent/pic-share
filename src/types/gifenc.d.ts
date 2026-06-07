declare module "gifenc" {
  type Palette = number[][];

  type GifEncoder = {
    writeFrame: (
      index: Uint8Array,
      width: number,
      height: number,
      options?: {
        delay?: number;
        palette?: Palette;
        repeat?: number;
      },
    ) => void;
    finish: () => void;
    bytes: () => Uint8Array;
  };

  export function GIFEncoder(options?: {
    initialCapacity?: number;
  }): GifEncoder;
  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
  ): Palette;
  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: Palette,
  ): Uint8Array;
}

import { IPixel } from "@/types";

import { CANVAS_DATA } from "@/data/canvas";

/**
 * Off-screen buffer with one canvas pixel per game pixel. Panning and zooming only
 * copy this image to the screen, however many pixels have been painted.
 */
const pixelLayer = document.createElement("canvas");
pixelLayer.width = CANVAS_DATA.CANVAS_WIDTH;
pixelLayer.height = CANVAS_DATA.CANVAS_HEIGHT;

const context = pixelLayer.getContext("2d");

const VALID_COLOR = /^#[0-9a-fA-F]{6}$/;

const paintPixels = (pixels: Iterable<IPixel>) => {
  if (!context) return;

  for (const { x, y, color } of pixels) {
    // An invalid fillStyle is ignored, which would repeat the previous color.
    if (!VALID_COLOR.test(color)) continue;

    context.fillStyle = color;
    context.fillRect(x, y, 1, 1);
  }
};

const clearPixelLayer = () => {
  context?.clearRect(0, 0, pixelLayer.width, pixelLayer.height);
};

export { pixelLayer, paintPixels, clearPixelLayer };

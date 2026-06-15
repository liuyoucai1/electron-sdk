export const DESIGN_VIEWPORT = Object.freeze({
  width: 1920,
  height: 1080,
});

const DEFAULT_LIMITS = Object.freeze({
  minScale: 0.75,
  maxScale: 2,
});

// Calculate a single app scale from the 1920x1080 design viewport.
export function calculateAppScale(viewport = {}, options = {}) {
  const designWidth = Number(options.designWidth) || DESIGN_VIEWPORT.width;
  const designHeight = Number(options.designHeight) || DESIGN_VIEWPORT.height;
  const minScale = Number(options.minScale) || DEFAULT_LIMITS.minScale;
  const maxScale = Number(options.maxScale) || DEFAULT_LIMITS.maxScale;
  const devicePixelRatio = Number(options.devicePixelRatio) || 1;
  const width = Number(viewport.width);
  const height = Number(viewport.height);

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return 1;
  }

  const viewportScale = Math.min(width / designWidth, height / designHeight);
  const rawScale = options.compensateDevicePixelRatio
    ? viewportScale / Math.sqrt(Math.max(1, devicePixelRatio))
    : viewportScale;

  return Math.min(maxScale, Math.max(minScale, rawScale));
}

import type { SeaLionMetadata } from '../api/types'

const DEFAULTS = {
  bodyScaleX: 1,
  bodyScaleY: 1,
  headScale: 1,
  snoutLength: 1,
  tailLength: 1,
  flipperSpread: 1,
  eyeSize: 1,
  eyeSpacing: 1,
  patternOpacity: 0.12,
  stripeCount: 7,
  stripeWidth: 1,
  waveIntensity: 1,
}

export function resolveTraits(m: SeaLionMetadata) {
  return {
    bodyScaleX: m.bodyScaleX ?? DEFAULTS.bodyScaleX,
    bodyScaleY: m.bodyScaleY ?? DEFAULTS.bodyScaleY,
    headScale: m.headScale ?? DEFAULTS.headScale,
    snoutLength: m.snoutLength ?? DEFAULTS.snoutLength,
    tailLength: m.tailLength ?? DEFAULTS.tailLength,
    flipperSpread: m.flipperSpread ?? DEFAULTS.flipperSpread,
    eyeSize: m.eyeSize ?? DEFAULTS.eyeSize,
    eyeSpacing: m.eyeSpacing ?? DEFAULTS.eyeSpacing,
    patternOpacity: m.patternOpacity ?? DEFAULTS.patternOpacity,
    stripeCount: m.stripeCount ?? DEFAULTS.stripeCount,
    stripeWidth: m.stripeWidth ?? DEFAULTS.stripeWidth,
    waveIntensity: m.waveIntensity ?? DEFAULTS.waveIntensity,
    backgroundStyle: m.backgroundStyle ?? 'waves',
    patternMarks: m.patternMarks ?? [],
  }
}

export function scaleBody(
  m: SeaLionMetadata,
  rx: number,
  ry: number,
): { rx: number; ry: number } {
  const t = resolveTraits(m)
  return {
    rx: rx * t.bodyScaleX,
    ry: ry * t.bodyScaleY,
  }
}

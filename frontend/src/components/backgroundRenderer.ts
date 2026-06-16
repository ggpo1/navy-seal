import type { BackgroundMark, SeaLionMetadata } from '../api/types'
import { resolveTraits } from './sealTraits'

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  m: SeaLionMetadata,
  w: number,
  h: number,
) {
  const traits = resolveTraits(m)
  const style = traits.backgroundStyle
  const primary = m.backgroundColor
  const secondary = m.backgroundColorSecondary ?? lightenHex(primary, 0.18)
  const accent = m.backgroundAccentColor ?? '#ffffff'
  const seed = m.seed ?? 0

  switch (style) {
    case 'plain':
      ctx.fillStyle = primary
      ctx.fillRect(0, 0, w, h)
      break
    case 'gradient':
      paintLinearGradient(ctx, 0, 0, 0, h, [primary, secondary], w, h)
      break
    case 'beach':
      paintLinearGradient(ctx, 0, 0, 0, h, [primary, secondary], w, h)
      paintHorizon(ctx, w, h, secondary, 0.58)
      break
    case 'sunset':
      paintLinearGradient(ctx, 0, 0, 0, h, [secondary, primary, accent], w, h)
      break
    case 'bubbles':
      paintLinearGradient(ctx, 0, 0, 0, h, [secondary, primary], w, h)
      break
    case 'coral':
      paintLinearGradient(ctx, 0, 0, 0, h, [primary, secondary], w, h)
      break
    case 'deepSea':
      paintLinearGradient(ctx, 0, 0, 0, h, [secondary, primary], w, h)
      break
    case 'aurora':
      ctx.fillStyle = primary
      ctx.fillRect(0, 0, w, h)
      paintAuroraBands(ctx, m, w, h, secondary, accent)
      break
    case 'starry':
      paintLinearGradient(ctx, 0, 0, 0, h, [primary, secondary], w, h)
      break
    case 'waves':
    default:
      paintLinearGradient(ctx, 0, 0, 0, h, [secondary, primary], w, h)
      break
  }

  drawBackgroundMarks(ctx, traits.backgroundMarks, w, h, accent, secondary, seed)

  if (style === 'waves' || style === 'beach') {
    drawWaves(ctx, w, h, seed, traits.waveIntensity, accent, style === 'beach' ? 0.55 : 1)
  }
}

function paintLinearGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  colors: string[],
  w: number,
  h: number,
) {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
  colors.forEach((color, index) => {
    gradient.addColorStop(index / Math.max(colors.length - 1, 1), color)
  })
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)
}

function paintHorizon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sandColor: string,
  ratio: number,
) {
  const y = h * ratio
  ctx.fillStyle = sandColor
  ctx.fillRect(0, y, w, h - y)
}

function drawWaves(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: number,
  waveIntensity: number,
  accent: string,
  strength = 1,
) {
  ctx.strokeStyle = withAlpha(accent, 0.2 + waveIntensity * 0.12)
  ctx.lineWidth = 1 + waveIntensity * 0.8
  const waveCount = 3
  for (let i = 0; i < waveCount; i++) {
    ctx.beginPath()
    const y = h * (0.68 + i * 0.07)
    ctx.moveTo(0, y)
    for (let x = 0; x <= w; x += 16) {
      const amp = (3 + waveIntensity * 3) * (1 + i * 0.2) * strength
      ctx.lineTo(x, y + Math.sin((x + i * 40 + seed) * 0.04) * amp)
    }
    ctx.stroke()
  }
}

function paintAuroraBands(
  ctx: CanvasRenderingContext2D,
  m: SeaLionMetadata,
  w: number,
  h: number,
  secondary: string,
  accent: string,
) {
  const bands = m.backgroundMarks?.filter((mark) => mark.kind === 'aurora') ?? []
  const colors = [secondary, accent, lightenHex(secondary, 0.2)]

  bands.forEach((band, index) => {
    const y = band.y * h
    const bandH = band.size * h * 0.22
    const gradient = ctx.createLinearGradient(0, y - bandH, 0, y + bandH)
    gradient.addColorStop(0, withAlpha(colors[index % colors.length], 0))
    gradient.addColorStop(0.5, withAlpha(colors[index % colors.length], band.opacity))
    gradient.addColorStop(1, withAlpha(colors[index % colors.length], 0))
    ctx.fillStyle = gradient
    ctx.fillRect(0, y - bandH, w, bandH * 2)
  })
}

function drawBackgroundMarks(
  ctx: CanvasRenderingContext2D,
  marks: BackgroundMark[],
  w: number,
  h: number,
  accent: string,
  secondary: string,
  seed: number,
) {
  for (const mark of marks) {
    if (mark.kind === 'aurora') continue

    const x = mark.x * w
    const y = mark.y * h
    const size = mark.size * Math.min(w, h)

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((mark.rotation * Math.PI) / 180)
    ctx.globalAlpha = mark.opacity

    switch (mark.kind) {
      case 'bubble':
        drawBubble(ctx, size, accent)
        break
      case 'star':
        drawStar(ctx, size, accent)
        break
      case 'sparkle':
        drawSparkle(ctx, size, accent)
        break
      case 'cloud':
        drawCloud(ctx, size, accent)
        break
      case 'sun':
        drawSun(ctx, size, accent)
        break
      case 'ray':
        drawRay(ctx, size, accent, w, h, seed)
        break
      case 'coral':
        drawCoral(ctx, size, secondary, accent)
        break
    }

    ctx.restore()
  }
}

function drawBubble(ctx: CanvasRenderingContext2D, radius: number, accent: string) {
  ctx.strokeStyle = withAlpha(accent, 0.75)
  ctx.lineWidth = Math.max(1, radius * 0.12)
  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = withAlpha(accent, 0.12)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(-radius * 0.25, -radius * 0.25, radius * 0.18, 0, Math.PI * 2)
  ctx.fillStyle = withAlpha('#ffffff', 0.45)
  ctx.fill()
}

function drawStar(ctx: CanvasRenderingContext2D, radius: number, accent: string) {
  ctx.fillStyle = accent
  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
    ctx.lineTo(Math.cos(angle + Math.PI / 4) * radius * 0.35, Math.sin(angle + Math.PI / 4) * radius * 0.35)
  }
  ctx.closePath()
  ctx.fill()
}

function drawSparkle(ctx: CanvasRenderingContext2D, radius: number, accent: string) {
  ctx.strokeStyle = accent
  ctx.lineWidth = Math.max(1, radius * 0.2)
  ctx.beginPath()
  ctx.moveTo(-radius, 0)
  ctx.lineTo(radius, 0)
  ctx.moveTo(0, -radius)
  ctx.lineTo(0, radius)
  ctx.stroke()
}

function drawCloud(ctx: CanvasRenderingContext2D, size: number, accent: string) {
  ctx.fillStyle = withAlpha(accent, 0.85)
  ;[
    [0, 0, size * 0.55],
    [-size * 0.45, size * 0.08, size * 0.38],
    [size * 0.42, size * 0.1, size * 0.34],
  ].forEach(([x, y, r]) => {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  })
}

function drawSun(ctx: CanvasRenderingContext2D, radius: number, accent: string) {
  const glow = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 2.2)
  glow.addColorStop(0, withAlpha(accent, 0.95))
  glow.addColorStop(0.45, withAlpha(accent, 0.35))
  glow.addColorStop(1, withAlpha(accent, 0))
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(0, 0, radius * 2.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, Math.PI * 2)
  ctx.fill()
}

function drawRay(
  ctx: CanvasRenderingContext2D,
  size: number,
  accent: string,
  w: number,
  h: number,
  seed: number,
) {
  const gradient = ctx.createLinearGradient(0, -h * 0.2, 0, h * 0.8)
  gradient.addColorStop(0, withAlpha(accent, 0.28))
  gradient.addColorStop(1, withAlpha(accent, 0))
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.moveTo(-size * w * 0.18, -h * 0.2)
  ctx.lineTo(size * w * 0.18, -h * 0.2)
  ctx.lineTo(size * w * 0.05, h * 0.85)
  ctx.lineTo(-size * w * 0.05, h * 0.85)
  ctx.closePath()
  ctx.fill()
  void seed
}

function drawCoral(
  ctx: CanvasRenderingContext2D,
  size: number,
  secondary: string,
  accent: string,
) {
  ctx.fillStyle = withAlpha(secondary, 0.85)
  ctx.beginPath()
  ctx.moveTo(0, size)
  ctx.quadraticCurveTo(size * 0.7, size * 0.2, 0, -size * 0.8)
  ctx.quadraticCurveTo(-size * 0.65, size * 0.15, 0, size)
  ctx.fill()
  ctx.fillStyle = withAlpha(accent, 0.55)
  ctx.beginPath()
  ctx.arc(size * 0.15, -size * 0.15, size * 0.22, 0, Math.PI * 2)
  ctx.fill()
}

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '')
  const value = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function lightenHex(hex: string, amount: number): string {
  return mixHex(hex, '#ffffff', amount)
}

function mixHex(hex: string, target: string, amount: number): string {
  const source = parseHex(hex)
  const dest = parseHex(target)
  const mix = (from: number, to: number) => Math.round(from + (to - from) * amount)
  const r = mix(source.r, dest.r)
  const g = mix(source.g, dest.g)
  const b = mix(source.b, dest.b)
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function parseHex(hex: string) {
  const normalized = hex.replace('#', '')
  const value = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  }
}

function toHex(value: number) {
  return value.toString(16).padStart(2, '0')
}

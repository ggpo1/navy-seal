import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SeaLionMetadata } from '../api/types'
import { resolveTraits, scaleBody } from './sealTraits'

const DESIGN_EXTENT = 150

interface Props {
  metadata: SeaLionMetadata
  width?: number
  height?: number
  className?: string
  showLabel?: boolean
}

export function SeaLionCanvas({
  metadata,
  width,
  height,
  className,
  showLabel = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { t } = useTranslation()
  const [drawSize, setDrawSize] = useState({
    width: width ?? 320,
    height: height ?? 320,
  })

  useEffect(() => {
    if (width != null && height != null) {
      setDrawSize({ width, height })
      return
    }

    const container = containerRef.current
    if (!container) return

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      const side = Math.max(1, Math.floor(Math.min(rect.width, rect.height)))
      setDrawSize({ width: side, height: side })
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [width, height])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width: w, height: h } = drawSize
    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    drawSeaLion(ctx, metadata, w, h, showLabel)
  }, [metadata, drawSize, showLabel])

  const fixedSize = width != null && height != null

  return (
    <div
      ref={containerRef}
      className={className ?? 'seal-canvas-wrap'}
      style={fixedSize ? { width, height } : undefined}
    >
      <canvas
        ref={canvasRef}
        aria-label={`${metadata.name}, ${t(`pose.${metadata.pose ?? 'upright'}`)} pose`}
      />
    </div>
  )
}

function drawSeaLion(
  ctx: CanvasRenderingContext2D,
  m: SeaLionMetadata,
  w: number,
  h: number,
  showLabel: boolean,
) {
  ctx.clearRect(0, 0, w, h)

  ctx.fillStyle = m.backgroundColor
  ctx.fillRect(0, 0, w, h)

  drawBackground(ctx, m, w, h)

  const labelReserve = showLabel ? 24 : 0
  const drawH = h - labelReserve
  const cx = w / 2
  const cy = drawH / 2 + (showLabel ? 4 : 8)
  const pose = m.pose || 'upright'
  const rotationPadding = 1 + Math.abs(m.rotation) / 180 * 0.12
  const fitScale =
    (Math.min(w, drawH) / (DESIGN_EXTENT * 2 * m.size * rotationPadding)) * 0.94

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((m.rotation * Math.PI) / 180)
  ctx.scale(fitScale * m.size, fitScale * m.size)

  switch (pose) {
    case 'lying':
      drawLyingPose(ctx, m)
      break
    case 'sitting':
      drawSittingPose(ctx, m)
      break
    case 'barking':
      drawBarkingPose(ctx, m)
      break
    case 'swimming':
      drawSwimmingPose(ctx, m)
      break
    case 'stretching':
      drawStretchingPose(ctx, m)
      break
    case 'bellyUp':
      drawBellyUpPose(ctx, m)
      break
    default:
      drawUprightPose(ctx, m)
  }

  ctx.restore()

  if (showLabel) {
    const fontSize = Math.max(11, Math.min(16, w * 0.05))
    ctx.fillStyle = '#1a3a4a'
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(m.name, cx, h - Math.max(8, fontSize * 0.75))
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, m: SeaLionMetadata, w: number, h: number) {
  const { backgroundStyle, waveIntensity } = resolveTraits(m)

  if (backgroundStyle === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    gradient.addColorStop(0, m.backgroundColor)
    gradient.addColorStop(1, 'rgba(255,255,255,0.55)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
  }

  if (backgroundStyle === 'plain') return

  ctx.strokeStyle = `rgba(255,255,255,${0.2 + waveIntensity * 0.12})`
  ctx.lineWidth = 1 + waveIntensity * 0.8
  const waveCount = backgroundStyle === 'waves' ? 3 : 2
  for (let i = 0; i < waveCount; i++) {
    ctx.beginPath()
    const y = h * (0.72 + i * 0.06)
    ctx.moveTo(0, y)
    for (let x = 0; x <= w; x += 16) {
      const amp = (3 + waveIntensity * 3) * (1 + i * 0.2)
      ctx.lineTo(x, y + Math.sin((x + i * 40 + (m.seed ?? 0)) * 0.04) * amp)
    }
    ctx.stroke()
  }
}

function drawUprightPose(ctx: CanvasRenderingContext2D, m: SeaLionMetadata) {
  drawTail(ctx, m, 'default')
  drawBody(ctx, m, 0, 0, 85, 55, 0)
  drawFlippers(ctx, m, 'default')
  drawFace(ctx, m, 55, -15, 0)
  drawAccessory(ctx, m.accessory)
}

function drawLyingPose(ctx: CanvasRenderingContext2D, m: SeaLionMetadata) {
  ctx.save()
  ctx.translate(0, 25)
  ctx.rotate(-0.12)
  drawTail(ctx, m, 'straight')
  drawBody(ctx, m, 0, 0, 105, 38, 0)
  drawFlippers(ctx, m, 'tucked')
  drawFace(ctx, m, 82, -8, 0.05)
  drawAccessory(ctx, m.accessory, 0, 25)
  ctx.restore()
}

function drawSittingPose(ctx: CanvasRenderingContext2D, m: SeaLionMetadata) {
  drawTail(ctx, m, 'curled')
  drawBody(ctx, m, 0, 10, 58, 72, 0)
  drawFlippers(ctx, m, 'down')
  drawFace(ctx, m, 5, -48, 0)
  drawAccessory(ctx, m.accessory, -10, -20)
}

function drawBarkingPose(ctx: CanvasRenderingContext2D, m: SeaLionMetadata) {
  drawTail(ctx, m, 'default')
  drawBody(ctx, m, 0, 15, 78, 58, 0.1)
  drawFlippers(ctx, m, 'default')
  drawFace(ctx, m, 48, -38, -0.25)
  drawBarkMouth(ctx, 72, -18)
  drawAccessory(ctx, m.accessory)
}

function drawSwimmingPose(ctx: CanvasRenderingContext2D, m: SeaLionMetadata) {
  ctx.save()
  ctx.rotate(-0.35)
  drawTail(ctx, m, 'straight')
  drawBody(ctx, m, 0, 0, 112, 36, 0)
  drawFlippers(ctx, m, 'spread')
  drawFace(ctx, m, 88, -4, 0.15)
  drawAccessory(ctx, m.accessory, 15, 0)
  ctx.restore()
}

function drawStretchingPose(ctx: CanvasRenderingContext2D, m: SeaLionMetadata) {
  drawTail(ctx, m, 'down')
  drawBody(ctx, m, -5, 5, 80, 50, -0.35)
  drawFlippers(ctx, m, 'raised')
  drawFace(ctx, m, 35, -42, -0.5)
  drawAccessory(ctx, m.accessory, -20, -10)
}

function drawBellyUpPose(ctx: CanvasRenderingContext2D, m: SeaLionMetadata) {
  ctx.save()
  ctx.scale(1, -0.9)
  drawTail(ctx, m, 'curled')
  drawBody(ctx, m, 0, -10, 82, 52, 0)
  ctx.fillStyle = m.bellyColor
  ctx.beginPath()
  ctx.ellipse(0, -10, 72, 44, 0, 0, Math.PI * 2)
  ctx.fill()
  drawPattern(ctx, m)
  drawFlippers(ctx, m, 'spread')
  ctx.restore()
  drawFace(ctx, m, 50, 18, 0.2)
  drawAccessory(ctx, m.accessory, 0, 30)
}

function drawTail(
  ctx: CanvasRenderingContext2D,
  m: SeaLionMetadata,
  variant: 'default' | 'straight' | 'curled' | 'down',
) {
  const tail = resolveTraits(m).tailLength
  ctx.fillStyle = m.bodyColor
  ctx.beginPath()

  if (variant === 'straight') {
    ctx.moveTo(-95 * tail, 5)
    ctx.quadraticCurveTo(-130 * tail, 0, -125 * tail, -8)
    ctx.quadraticCurveTo(-110 * tail, 8, -85 * tail, 12)
  } else if (variant === 'curled') {
    ctx.moveTo(-55 * tail, 30)
    ctx.quadraticCurveTo(-85 * tail, 45, -70 * tail, 55)
    ctx.quadraticCurveTo(-50 * tail, 40, -45 * tail, 25)
  } else if (variant === 'down') {
    ctx.moveTo(-70 * tail, 15)
    ctx.quadraticCurveTo(-95 * tail, 45, -80 * tail, 60)
    ctx.quadraticCurveTo(-60 * tail, 35, -55 * tail, 20)
  } else {
    ctx.moveTo(-90 * tail, 20)
    ctx.quadraticCurveTo(-120 * tail, 0, -100 * tail, -30)
    ctx.quadraticCurveTo(-80 * tail, -10, -70 * tail, 10)
  }

  ctx.closePath()
  ctx.fill()
}

function drawBody(
  ctx: CanvasRenderingContext2D,
  m: SeaLionMetadata,
  x: number,
  y: number,
  rx: number,
  ry: number,
  angle: number,
) {
  const scaled = scaleBody(m, rx, ry)

  ctx.beginPath()
  ctx.ellipse(x, y, scaled.rx, scaled.ry, angle, 0, Math.PI * 2)
  const bodyGradient = ctx.createRadialGradient(
    x - scaled.rx * 0.2,
    y - scaled.ry * 0.3,
    scaled.rx * 0.2,
    x + scaled.rx * 0.25,
    y + scaled.ry * 0.25,
    scaled.rx * 1.25,
  )
  bodyGradient.addColorStop(0, lightenHex(m.bodyColor, 0.12))
  bodyGradient.addColorStop(1, darkenHex(m.bodyColor, 0.2))
  ctx.fillStyle = bodyGradient
  ctx.fill()

  ctx.save()
  ctx.clip()
  drawFurTexture(ctx, x, y, scaled.rx, scaled.ry, m.seed ?? 0)
  ctx.restore()

  ctx.fillStyle = m.bellyColor
  ctx.beginPath()
  ctx.ellipse(
    x + scaled.rx * 0.18,
    y + scaled.ry * 0.15,
    scaled.rx * 0.58,
    scaled.ry * 0.62,
    angle + 0.2,
    0,
    Math.PI * 2,
  )
  ctx.fill()

  const bellyShade = ctx.createRadialGradient(
    x + scaled.rx * 0.35,
    y + scaled.ry * 0.35,
    scaled.rx * 0.1,
    x + scaled.rx * 0.2,
    y + scaled.ry * 0.2,
    scaled.rx * 0.7,
  )
  bellyShade.addColorStop(0, 'rgba(255,255,255,0.2)')
  bellyShade.addColorStop(1, 'rgba(0,0,0,0.12)')
  ctx.fillStyle = bellyShade
  ctx.beginPath()
  ctx.ellipse(
    x + scaled.rx * 0.18,
    y + scaled.ry * 0.15,
    scaled.rx * 0.58,
    scaled.ry * 0.62,
    angle + 0.2,
    0,
    Math.PI * 2,
  )
  ctx.fill()

  drawPattern(ctx, m, x, y)
}

function drawFlippers(
  ctx: CanvasRenderingContext2D,
  m: SeaLionMetadata,
  variant: 'default' | 'tucked' | 'down' | 'spread' | 'raised',
) {
  const spread = resolveTraits(m).flipperSpread
  const flipperW = 35 * m.flipperLength * spread
  ctx.fillStyle = m.bodyColor

  if (variant === 'tucked') {
    ctx.beginPath()
    ctx.ellipse(-60, 8, flipperW * 0.7, 10, 0.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(55, 10, flipperW * 0.65, 9, -0.1, 0, Math.PI * 2)
    ctx.fill()
  } else if (variant === 'down') {
    ctx.beginPath()
    ctx.ellipse(-38, 45, 12, flipperW * 0.75, 0.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(38, 45, 12, flipperW * 0.75, -0.5, 0, Math.PI * 2)
    ctx.fill()
  } else if (variant === 'spread') {
    ctx.beginPath()
    ctx.ellipse(-55, -5, flipperW, 11, -0.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(35, 18, flipperW * 0.85, 10, 0.5, 0, Math.PI * 2)
    ctx.fill()
  } else if (variant === 'raised') {
    ctx.beginPath()
    ctx.ellipse(-50, -25, flipperW * 0.8, 12, -0.8, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(45, -20, flipperW * 0.75, 11, 0.7, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.ellipse(-45, 25, flipperW, 14, 0.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(50, 30, flipperW * 0.9, 12, -0.3, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  m: SeaLionMetadata,
  headX: number,
  headY: number,
  headAngle: number,
) {
  const traits = resolveTraits(m)
  const headRx = 42 * traits.headScale
  const headRy = 38 * traits.headScale
  const snoutRx = 22 * traits.snoutLength
  const snoutRy = 16 * traits.snoutLength
  const snoutOffsetX = 23 * traits.snoutLength
  const noseOffsetX = 37 * traits.snoutLength

  ctx.save()
  ctx.translate(headX, headY)
  ctx.rotate(headAngle)

  drawEar(ctx, -headRx * 0.35, -headRy * 0.75, headRx * 0.23, headRy * 0.2, m.bodyColor)
  drawEar(ctx, headRx * 0.22, -headRy * 0.72, headRx * 0.2, headRy * 0.18, m.bodyColor)

  ctx.beginPath()
  ctx.ellipse(0, 0, headRx, headRy, 0, 0, Math.PI * 2)
  const headGradient = ctx.createRadialGradient(
    -headRx * 0.2,
    -headRy * 0.3,
    headRx * 0.2,
    headRx * 0.25,
    headRy * 0.2,
    headRx * 1.2,
  )
  headGradient.addColorStop(0, lightenHex(m.bodyColor, 0.12))
  headGradient.addColorStop(1, darkenHex(m.bodyColor, 0.22))
  ctx.fillStyle = headGradient
  ctx.fill()

  ctx.fillStyle = m.bellyColor
  ctx.beginPath()
  ctx.ellipse(snoutOffsetX, 10, snoutRx, snoutRy, 0.1, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = m.noseColor
  ctx.beginPath()
  ctx.ellipse(noseOffsetX, 7, 6 * traits.snoutLength, 4 * traits.snoutLength, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = darkenHex(m.noseColor, 0.18)
  ctx.beginPath()
  ctx.arc(noseOffsetX - 2.3 * traits.snoutLength, 7.2, 1.3 * traits.snoutLength, 0, Math.PI * 2)
  ctx.arc(noseOffsetX + 2.3 * traits.snoutLength, 7.2, 1.3 * traits.snoutLength, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.beginPath()
  ctx.arc(noseOffsetX - 1.5, 5.5, 1.1, 0, Math.PI * 2)
  ctx.fill()

  drawEyes(ctx, m, -7, -13)
  drawExpression(ctx, m, 15, 13)

  if (m.whiskers) drawWhiskers(ctx, noseOffsetX - 4, 3)

  drawHat(ctx, m.hat, -headRx * 0.6, -headRy * 1.1)
  ctx.restore()
}

function drawBarkMouth(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#8b2942'
  ctx.beginPath()
  ctx.ellipse(x, y, 10, 14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffb4c0'
  ctx.beginPath()
  ctx.ellipse(x, y + 4, 6, 7, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawEar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  bodyColor: string,
) {
  ctx.fillStyle = darkenHex(bodyColor, 0.16)
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, -0.15, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = lightenHex(bodyColor, 0.08)
  ctx.beginPath()
  ctx.ellipse(x, y, rx * 0.55, ry * 0.55, -0.15, 0, Math.PI * 2)
  ctx.fill()
}

function drawFurTexture(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
) {
  const lineCount = 24
  for (let i = 0; i < lineCount; i++) {
    const t = i / lineCount
    const angle = ((seed % 17) * 0.03) + t * Math.PI * 1.9
    const px = cx + Math.cos(angle) * rx * 0.65
    const py = cy + Math.sin(angle * 1.4) * ry * 0.52
    ctx.strokeStyle = `rgba(255,255,255,${0.03 + (i % 5) * 0.01})`
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(px - 6, py - 2)
    ctx.lineTo(px + 6, py + 2)
    ctx.stroke()
  }
}

function lightenHex(hex: string, amount: number): string {
  return adjustHex(hex, Math.abs(amount))
}

function darkenHex(hex: string, amount: number): string {
  return adjustHex(hex, -Math.abs(amount))
}

function adjustHex(hex: string, delta: number): string {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return hex

  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)

  const transform = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value + 255 * delta)))

  const rr = transform(r).toString(16).padStart(2, '0')
  const gg = transform(g).toString(16).padStart(2, '0')
  const bb = transform(b).toString(16).padStart(2, '0')

  return `#${rr}${gg}${bb}`
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  m: SeaLionMetadata,
  offsetX = 0,
  offsetY = 0,
) {
  if (m.pattern === 'solid') return

  const traits = resolveTraits(m)
  ctx.fillStyle = `rgba(0,0,0,${traits.patternOpacity})`

  if (m.pattern === 'stripes') {
    const half = Math.floor(traits.stripeCount / 2)
    const gap = 14 * traits.stripeWidth
    for (let i = -half; i <= half; i++) {
      ctx.save()
      ctx.translate(offsetX + i * gap, offsetY)
      ctx.rotate(0.2 + (m.seed ?? 0) % 7 * 0.02)
      ctx.fillRect(-3 * traits.stripeWidth, -45, 6 * traits.stripeWidth, 90)
      ctx.restore()
    }
    return
  }

  const marks = traits.patternMarks
  if (marks.length > 0) {
    for (const mark of marks) {
      ctx.beginPath()
      ctx.arc(offsetX + mark.x, offsetY + mark.y, mark.radius, 0, Math.PI * 2)
      ctx.fill()
    }
    return
  }

  // fallback for legacy records
  const spots = [[-20, -10], [10, 15], [-40, 20], [30, -5], [0, 30]]
  for (const [x, y] of spots) {
    ctx.beginPath()
    ctx.arc(offsetX + x, offsetY + y, 6, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  m: SeaLionMetadata,
  baseX: number,
  baseY: number,
) {
  const { eyeSize, eyeSpacing } = resolveTraits(m)
  const outerR = 7 * eyeSize
  const pupilR = 4 * eyeSize
  const spacing = 24 * eyeSpacing

  const drawEye = (x: number, y: number, wink = false) => {
    if (m.eyeStyle === 'sleepy' || wink) {
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(baseX + x, baseY + y, 5 * eyeSize, 0.2, Math.PI - 0.2)
      ctx.stroke()
      return
    }

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(baseX + x, baseY + y, outerR, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.arc(baseX + x + 1, baseY + y, pupilR, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(baseX + x + 2, baseY + y - 2, 1.5 * eyeSize, 0, Math.PI * 2)
    ctx.fill()
  }

  drawEye(0, 0)
  drawEye(m.eyeStyle === 'wink' ? spacing - 4 : spacing, 0, m.eyeStyle === 'wink')
}

function drawExpression(
  ctx: CanvasRenderingContext2D,
  m: SeaLionMetadata,
  mouthX: number,
  mouthY: number,
) {
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'

  if (m.pose === 'barking') return

  if (m.expression === 'happy') {
    ctx.beginPath()
    ctx.arc(mouthX, mouthY, 10, 0.2, Math.PI - 0.2)
    ctx.stroke()
  } else if (m.expression === 'curious') {
    ctx.beginPath()
    ctx.arc(mouthX, mouthY + 4, 8, Math.PI + 0.3, -0.3)
    ctx.stroke()
  } else if (m.expression === 'surprised') {
    ctx.beginPath()
    ctx.arc(mouthX, mouthY + 2, 5, 0, Math.PI * 2)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(mouthX - 8, mouthY + 2)
    ctx.lineTo(mouthX + 8, mouthY + 2)
    ctx.stroke()
  }
}

function drawWhiskers(ctx: CanvasRenderingContext2D, baseX: number, baseY: number) {
  ctx.strokeStyle = 'rgba(30,30,30,0.6)'
  ctx.lineWidth = 1
  const lines = [
    [0, -9, 22, -15],
    [0, -3, 24, -3],
    [0, 3, 22, 9],
    [0, -9, -22, -17],
    [0, -3, -24, -11],
  ]
  for (const [x1, y1, x2, y2] of lines) {
    ctx.beginPath()
    ctx.moveTo(baseX + x1, baseY + y1)
    ctx.lineTo(baseX + x2, baseY + y2)
    ctx.stroke()
  }
}

function drawHat(
  ctx: CanvasRenderingContext2D,
  hat: string | null,
  x: number,
  y: number,
) {
  if (!hat) return

  if (hat === 'captain' || hat === 'sailor') {
    ctx.fillStyle = hat === 'captain' ? '#1a2a4a' : '#fff'
    ctx.fillRect(x, y + 15, 50, 12)
    ctx.fillRect(x + 8, y, 34, 16)
    if (hat === 'captain') {
      ctx.fillStyle = '#ffd700'
      ctx.fillRect(x + 22, y + 4, 6, 8)
    }
  } else if (hat === 'party') {
    ctx.fillStyle = '#ff6b9d'
    ctx.beginPath()
    ctx.moveTo(x + 25, y - 2)
    ctx.lineTo(x + 10, y + 23)
    ctx.lineTo(x + 40, y + 23)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#4ecdc4'
    ctx.beginPath()
    ctx.arc(x + 25, y - 2, 5, 0, Math.PI * 2)
    ctx.fill()
  } else if (hat === 'crown') {
    ctx.fillStyle = '#ffd700'
    ctx.beginPath()
    ctx.moveTo(x + 5, y + 23)
    ctx.lineTo(x + 10, y + 7)
    ctx.lineTo(x + 20, y + 20)
    ctx.lineTo(x + 30, y + 5)
    ctx.lineTo(x + 40, y + 20)
    ctx.lineTo(x + 45, y + 23)
    ctx.closePath()
    ctx.fill()
  }
}

function drawAccessory(
  ctx: CanvasRenderingContext2D,
  accessory: string | null,
  offsetX = 0,
  offsetY = 0,
) {
  if (!accessory) return

  if (accessory === 'ball') {
    ctx.fillStyle = '#e74c3c'
    ctx.beginPath()
    ctx.arc(-70 + offsetX, -20 + offsetY, 14, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(-70 + offsetX, -20 + offsetY, 14, 0.5, Math.PI + 0.5)
    ctx.stroke()
  } else if (accessory === 'fish') {
    ctx.fillStyle = '#3498db'
    ctx.beginPath()
    ctx.ellipse(-75 + offsetX, 10 + offsetY, 18, 10, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#2980b9'
    ctx.beginPath()
    ctx.moveTo(-95 + offsetX, 10 + offsetY)
    ctx.lineTo(-105 + offsetX, 0 + offsetY)
    ctx.lineTo(-105 + offsetX, 20 + offsetY)
    ctx.closePath()
    ctx.fill()
  } else if (accessory === 'anchor') {
    ctx.strokeStyle = '#555'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(85 + offsetX, 35 + offsetY)
    ctx.lineTo(85 + offsetX, 55 + offsetY)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(85 + offsetX, 40 + offsetY, 8, Math.PI, 0)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(77 + offsetX, 55 + offsetY)
    ctx.lineTo(93 + offsetX, 55 + offsetY)
    ctx.stroke()
  } else if (accessory === 'starfish') {
    drawStar(ctx, 80 + offsetX, 40 + offsetY, 12, '#f39c12')
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
) {
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
}

import { useEffect, useRef } from 'react'
import type { SeaLionMetadata } from '../api/types'

interface Props {
  metadata: SeaLionMetadata
  width?: number
  height?: number
  className?: string
}

export function SeaLionCanvas({ metadata, width = 320, height = 320, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    drawSeaLion(ctx, metadata, width, height)
  }, [metadata, width, height])

  return <canvas ref={canvasRef} className={className} aria-label={metadata.name} />
}

function drawSeaLion(
  ctx: CanvasRenderingContext2D,
  m: SeaLionMetadata,
  w: number,
  h: number,
) {
  ctx.clearRect(0, 0, w, h)

  // background
  ctx.fillStyle = m.backgroundColor
  ctx.fillRect(0, 0, w, h)

  // water waves
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 2
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    const y = h * 0.75 + i * 12
    ctx.moveTo(0, y)
    for (let x = 0; x <= w; x += 20) {
      ctx.lineTo(x, y + Math.sin((x + i * 30) * 0.05) * 4)
    }
    ctx.stroke()
  }

  const cx = w / 2
  const cy = h / 2 + 10
  const scale = m.size

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((m.rotation * Math.PI) / 180)
  ctx.scale(scale, scale)

  // tail
  ctx.fillStyle = m.bodyColor
  ctx.beginPath()
  ctx.moveTo(-90, 20)
  ctx.quadraticCurveTo(-120, 0, -100, -30)
  ctx.quadraticCurveTo(-80, -10, -70, 10)
  ctx.closePath()
  ctx.fill()

  // body
  ctx.fillStyle = m.bodyColor
  ctx.beginPath()
  ctx.ellipse(0, 0, 85, 55, 0, 0, Math.PI * 2)
  ctx.fill()

  // belly
  ctx.fillStyle = m.bellyColor
  ctx.beginPath()
  ctx.ellipse(15, 8, 50, 35, 0.2, 0, Math.PI * 2)
  ctx.fill()

  drawPattern(ctx, m)

  // flippers
  const flipperW = 35 * m.flipperLength
  ctx.fillStyle = m.bodyColor
  ctx.beginPath()
  ctx.ellipse(-45, 25, flipperW, 14, 0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(50, 30, flipperW * 0.9, 12, -0.3, 0, Math.PI * 2)
  ctx.fill()

  // head
  ctx.fillStyle = m.bodyColor
  ctx.beginPath()
  ctx.ellipse(55, -15, 42, 38, 0, 0, Math.PI * 2)
  ctx.fill()

  // snout
  ctx.fillStyle = m.bellyColor
  ctx.beginPath()
  ctx.ellipse(78, -5, 22, 16, 0.1, 0, Math.PI * 2)
  ctx.fill()

  // nose
  ctx.fillStyle = m.noseColor
  ctx.beginPath()
  ctx.ellipse(92, -8, 6, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  drawEyes(ctx, m)
  drawExpression(ctx, m)

  if (m.whiskers) drawWhiskers(ctx)

  drawHat(ctx, m.hat)
  drawAccessory(ctx, m.accessory)

  ctx.restore()

  // name label
  ctx.fillStyle = '#1a3a4a'
  ctx.font = 'bold 16px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(m.name, cx, h - 16)
}

function drawPattern(ctx: CanvasRenderingContext2D, m: SeaLionMetadata) {
  if (m.pattern === 'solid') return

  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  if (m.pattern === 'spots') {
    const spots = [[-20, -10], [10, 15], [-40, 20], [30, -5], [0, 30]]
    for (const [x, y] of spots) {
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (m.pattern === 'stripes') {
    for (let i = -3; i <= 3; i++) {
      ctx.save()
      ctx.translate(i * 18, 0)
      ctx.rotate(0.3)
      ctx.fillRect(-4, -40, 8, 80)
      ctx.restore()
    }
  }
}

function drawEyes(ctx: CanvasRenderingContext2D, m: SeaLionMetadata) {
  const drawEye = (x: number, y: number, wink = false) => {
    if (m.eyeStyle === 'sleepy' || wink) {
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(x, y, 5, 0.2, Math.PI - 0.2)
      ctx.stroke()
      return
    }

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(x, y, 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.arc(x + 1, y, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(x + 2, y - 2, 1.5, 0, Math.PI * 2)
    ctx.fill()
  }

  drawEye(48, -28)
  drawEye(m.eyeStyle === 'wink' ? 68 : 72, -28, m.eyeStyle === 'wink')
}

function drawExpression(ctx: CanvasRenderingContext2D, m: SeaLionMetadata) {
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'

  if (m.expression === 'happy') {
    ctx.beginPath()
    ctx.arc(70, -2, 10, 0.2, Math.PI - 0.2)
    ctx.stroke()
  } else if (m.expression === 'curious') {
    ctx.beginPath()
    ctx.arc(70, 2, 8, Math.PI + 0.3, -0.3)
    ctx.stroke()
  } else if (m.expression === 'surprised') {
    ctx.beginPath()
    ctx.arc(70, 0, 5, 0, Math.PI * 2)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(62, 0)
    ctx.lineTo(78, 0)
    ctx.stroke()
  }
}

function drawWhiskers(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = 'rgba(30,30,30,0.6)'
  ctx.lineWidth = 1
  const lines = [
    [88, -12, 110, -18],
    [88, -6, 112, -6],
    [88, 0, 110, 6],
    [88, -12, 66, -20],
    [88, -6, 64, -8],
  ]
  for (const [x1, y1, x2, y2] of lines) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
}

function drawHat(ctx: CanvasRenderingContext2D, hat: string | null) {
  if (!hat) return

  if (hat === 'captain' || hat === 'sailor') {
    ctx.fillStyle = hat === 'captain' ? '#1a2a4a' : '#fff'
    ctx.fillRect(30, -58, 50, 12)
    ctx.fillRect(38, -72, 34, 16)
    if (hat === 'captain') {
      ctx.fillStyle = '#ffd700'
      ctx.fillRect(52, -68, 6, 8)
    }
  } else if (hat === 'party') {
    ctx.fillStyle = '#ff6b9d'
    ctx.beginPath()
    ctx.moveTo(55, -75)
    ctx.lineTo(40, -50)
    ctx.lineTo(70, -50)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#4ecdc4'
    ctx.beginPath()
    ctx.arc(55, -75, 5, 0, Math.PI * 2)
    ctx.fill()
  } else if (hat === 'crown') {
    ctx.fillStyle = '#ffd700'
    ctx.beginPath()
    ctx.moveTo(35, -52)
    ctx.lineTo(40, -68)
    ctx.lineTo(50, -55)
    ctx.lineTo(60, -70)
    ctx.lineTo(70, -55)
    ctx.lineTo(75, -52)
    ctx.closePath()
    ctx.fill()
  }
}

function drawAccessory(ctx: CanvasRenderingContext2D, accessory: string | null) {
  if (!accessory) return

  if (accessory === 'ball') {
    ctx.fillStyle = '#e74c3c'
    ctx.beginPath()
    ctx.arc(-70, -20, 14, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(-70, -20, 14, 0.5, Math.PI + 0.5)
    ctx.stroke()
  } else if (accessory === 'fish') {
    ctx.fillStyle = '#3498db'
    ctx.beginPath()
    ctx.ellipse(-75, 10, 18, 10, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#2980b9'
    ctx.beginPath()
    ctx.moveTo(-95, 10)
    ctx.lineTo(-105, 0)
    ctx.lineTo(-105, 20)
    ctx.closePath()
    ctx.fill()
  } else if (accessory === 'anchor') {
    ctx.strokeStyle = '#555'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(85, 35)
    ctx.lineTo(85, 55)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(85, 40, 8, Math.PI, 0)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(77, 55)
    ctx.lineTo(93, 55)
    ctx.stroke()
  } else if (accessory === 'starfish') {
    drawStar(ctx, 80, 40, 12, '#f39c12')
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

import * as THREE from 'three'

/** Small deterministic PRNG so procedural assets look the same on every load. */
export function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const spongeCache = new Map()

/**
 * Crumb texture for sponge cake: a colour map plus a matching bump map,
 * painted on a canvas (pores, air bubbles and crumbs).
 */
export function getSpongeTextures({ base, pore, crumb }, size = 512) {
  const key = `${base}|${pore}|${crumb}|${size}`
  if (spongeCache.has(key)) return spongeCache.get(key)

  const color = document.createElement('canvas')
  const bump = document.createElement('canvas')
  color.width = color.height = bump.width = bump.height = size
  const c = color.getContext('2d')
  const b = bump.getContext('2d')

  c.fillStyle = base
  c.fillRect(0, 0, size, size)
  b.fillStyle = '#9a9a9a'
  b.fillRect(0, 0, size, size)

  const rand = mulberry32(7)
  const dots = Math.round(size * size * 0.018)
  for (let i = 0; i < dots; i++) {
    const x = rand() * size
    const y = rand() * size
    const r = Math.pow(rand(), 2.4) * size * 0.012 + 0.6
    const isPore = rand() < 0.62
    c.globalAlpha = isPore ? 0.55 + rand() * 0.4 : 0.35 + rand() * 0.4
    c.fillStyle = isPore ? pore : crumb
    c.beginPath()
    c.ellipse(x, y, r * (0.8 + rand() * 0.6), r, rand() * Math.PI, 0, Math.PI * 2)
    c.fill()

    b.globalAlpha = 0.8
    b.fillStyle = isPore ? '#1e1e1e' : '#f2f2f2'
    b.beginPath()
    b.ellipse(x, y, r * (0.8 + rand() * 0.6), r, rand() * Math.PI, 0, Math.PI * 2)
    b.fill()
  }

  const map = new THREE.CanvasTexture(color)
  map.colorSpace = THREE.SRGBColorSpace
  const bumpMap = new THREE.CanvasTexture(bump)
  for (const t of [map, bumpMap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = 4
  }

  const result = { map, bumpMap }
  spongeCache.set(key, result)
  return result
}

let shadowTexture
/** Soft radial gradient used as a fake contact shadow under floating objects. */
export function getShadowTexture() {
  if (shadowTexture) return shadowTexture
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(60, 10, 5, 0.75)')
  g.addColorStop(0.45, 'rgba(60, 10, 5, 0.3)')
  g.addColorStop(1, 'rgba(60, 10, 5, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  shadowTexture = new THREE.CanvasTexture(canvas)
  shadowTexture.colorSpace = THREE.SRGBColorSpace
  return shadowTexture
}

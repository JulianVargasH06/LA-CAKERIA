import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { mulberry32 } from './textures'

const DRUPELET_COLORS = ['#b0102a', '#c21a35', '#9c0c22', '#d22a44', '#a8132c', '#bf2240']
const cache = new Map()

/**
 * Procedural raspberry: rings of small spheres (drupelets) laid over a
 * thimble-shaped profile, merged into a single geometry with per-drupelet
 * vertex colours. The opening of the berry faces -Y.
 *
 * @param {number} detail Icosahedron subdivision of each drupelet (0 = mobile).
 */
export function getRaspberryGeometry(detail = 1) {
  if (cache.has(detail)) return cache.get(detail)

  const rand = mulberry32(42 + detail)
  const unit = new THREE.IcosahedronGeometry(1, detail)
  unit.deleteAttribute('uv')
  const parts = []
  const color = new THREE.Color()

  const RADIUS = 0.5
  const HEIGHT = 0.6
  const RINGS = 9

  const addDrupelet = (x, y, z, size) => {
    const g = unit.clone()
    g.scale(size, size * 1.06, size)
    g.translate(x, y, z)
    color.set(DRUPELET_COLORS[Math.floor(rand() * DRUPELET_COLORS.length)])
    color.offsetHSL((rand() - 0.5) * 0.015, 0, (rand() - 0.5) * 0.05)
    const count = g.attributes.position.count
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    parts.push(g)
  }

  // crown
  addDrupelet(0, HEIGHT * 1.02, 0, 0.12)

  for (let i = 0; i < RINGS; i++) {
    const k = i / (RINGS - 1)
    const phi = 0.2 + k * Math.PI * 0.74
    // wider towards the opening, like a real thimble-shaped berry
    const ringRadius = Math.sin(phi) * RADIUS * (0.86 + 0.22 * k)
    const y = Math.cos(phi) * HEIGHT
    const count = Math.max(4, Math.round((Math.PI * 2 * ringRadius) / 0.165))
    const offset = (i % 2) * (Math.PI / count)
    for (let j = 0; j < count; j++) {
      const theta = (j / count) * Math.PI * 2 + offset + (rand() - 0.5) * 0.12
      const size = 0.105 * (0.88 + rand() * 0.24) * (1 - k * 0.12)
      addDrupelet(
        Math.cos(theta) * ringRadius,
        y + (rand() - 0.5) * 0.02,
        Math.sin(theta) * ringRadius,
        size,
      )
    }
  }

  // dark core fills the gaps between drupelets
  const core = new THREE.SphereGeometry(1, 20, 14)
  core.deleteAttribute('uv')
  core.scale(RADIUS * 0.84, HEIGHT * 0.9, RADIUS * 0.84)
  core.translate(0, 0.02, 0)
  const coreColors = new Float32Array(core.attributes.position.count * 3)
  color.set('#5c0614')
  for (let i = 0; i < core.attributes.position.count; i++) {
    coreColors.set([color.r, color.g, color.b], i * 3)
  }
  core.setAttribute('color', new THREE.BufferAttribute(coreColors, 3))
  parts.push(core.toNonIndexed())

  const merged = mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)))
  merged.computeBoundingSphere()
  cache.set(detail, merged)
  return merged
}

let berryMaterial
export function getRaspberryMaterial() {
  if (berryMaterial) return berryMaterial
  berryMaterial = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.34,
    clearcoat: 0.55,
    clearcoatRoughness: 0.28,
    sheen: 0.6,
    sheenRoughness: 0.45,
    sheenColor: new THREE.Color('#ffa29d'),
    emissive: new THREE.Color('#3a0008'),
    emissiveIntensity: 0.35,
  })
  return berryMaterial
}

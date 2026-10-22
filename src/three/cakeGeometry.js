import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { mulberry32 } from './textures'

/** Cake slab dimensions shared by the model and its toppings. */
export const CAKE = {
  width: 2.1,
  bottom: 0.72,
  filling: 0.2,
  top: 0.62,
  glaze: 0.14,
}
CAKE.base = -(CAKE.bottom + CAKE.filling + CAKE.top) / 2
CAKE.fillingY = CAKE.base + CAKE.bottom + CAKE.filling / 2
CAKE.topY = CAKE.base + CAKE.bottom + CAKE.filling + CAKE.top
CAKE.surface = CAKE.topY + CAKE.glaze * 0.75

const noise3 = (x, y, z, seed) =>
  Math.sin(x * 3.1 + seed) * Math.cos(z * 2.7 + seed * 1.7) * 0.5 +
  Math.sin(y * 7.3 + x * 1.9 + seed * 0.6) * 0.3 +
  Math.cos(z * 5.1 - y * 2.3 + seed * 2.2) * 0.2

/** Pushes vertices outwards (horizontally) by a smooth noise field. */
function displace(geometry, amplitude, seed, { verticalOnTop = 0 } = {}) {
  const pos = geometry.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const n = noise3(v.x, v.y, v.z, seed)
    const len = Math.hypot(v.x, v.z) || 1
    v.x += (v.x / len) * n * amplitude
    v.z += (v.z / len) * n * amplitude
    if (verticalOnTop && v.y > 0) v.y += n * verticalOnTop
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  pos.needsUpdate = true
}

/** Box-projected UVs so the crumb texture keeps its scale on every face. */
function boxProjectUVs(geometry, scale) {
  const pos = geometry.attributes.position
  const nor = geometry.attributes.normal
  const uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(nor.getX(i))
    const ny = Math.abs(nor.getY(i))
    const nz = Math.abs(nor.getZ(i))
    let u
    let w
    if (ny >= nx && ny >= nz) {
      u = pos.getX(i)
      w = pos.getZ(i)
    } else if (nx >= nz) {
      u = pos.getZ(i)
      w = pos.getY(i)
    } else {
      u = pos.getX(i)
      w = pos.getY(i)
    }
    uv[i * 2] = u * scale
    uv[i * 2 + 1] = w * scale
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
}

function smooth(geometry) {
  geometry.deleteAttribute('normal')
  geometry.deleteAttribute('uv')
  const welded = mergeVertices(geometry, 1e-4)
  welded.computeVertexNormals()
  return welded
}

export function createSpongeGeometry(height, seed, segments = 6) {
  const w = CAKE.width
  const g = new RoundedBoxGeometry(w, height, w, segments, 0.05)
  displace(g, 0.025, seed)
  boxProjectUVs(g, 0.55)
  return g
}

export function createFillingGeometry(segments = 8) {
  const w = CAKE.width + 0.1
  const g = new RoundedBoxGeometry(w, CAKE.filling, w, segments, 0.09)
  displace(g, 0.1, 3.3)
  return smooth(g)
}

/** Glossy top layer, wavy surface and a skirt of drips on every side. */
export function createGlazeGeometry(segments = 8, seed = 11) {
  const rand = mulberry32(seed)
  const w = CAKE.width + 0.07
  const half = w / 2
  const top = CAKE.topY + CAKE.glaze

  const slab = new RoundedBoxGeometry(w, CAKE.glaze, w, segments, 0.065)
  displace(slab, 0.012, 5.1, { verticalOnTop: 0.03 })
  slab.translate(0, CAKE.topY + CAKE.glaze / 2, 0)

  const parts = [smooth(slab)]
  const sides = [
    { axis: 'z', sign: 1 },
    { axis: 'z', sign: -1 },
    { axis: 'x', sign: 1 },
    { axis: 'x', sign: -1 },
  ]

  for (const { axis, sign } of sides) {
    // band that connects the drips along the edge
    const band = new RoundedBoxGeometry(
      axis === 'z' ? w : 0.07,
      0.24,
      axis === 'z' ? 0.07 : w,
      3,
      0.03,
    )
    band.translate(
      axis === 'x' ? sign * (half - 0.01) : 0,
      top - 0.14,
      axis === 'z' ? sign * (half - 0.005) : 0,
    )
    parts.push(smooth(band))

    // irregular drips: random spacing, widths and lengths, tops hidden in the band
    const drips = 4 + Math.floor(rand() * 3)
    const slots = Array.from({ length: drips }, () => rand()).sort()
    for (const slot of slots) {
      const t = -half + 0.14 + slot * (w - 0.28)
      const radius = 0.07 + rand() * 0.075
      const length = 0.06 + Math.pow(rand(), 1.5) * 0.9
      const drip = new THREE.CapsuleGeometry(radius, length, 6, 12)
      drip.scale(axis === 'x' ? 0.42 : 1, 1, axis === 'z' ? 0.42 : 1)
      const offset = half + radius * 0.05
      drip.translate(
        axis === 'x' ? sign * offset : t,
        top - 0.1 - radius - length / 2,
        axis === 'z' ? sign * offset : t,
      )
      parts.push(smooth(drip))
    }
  }

  // corner drips
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const length = 0.15 + rand() * 0.5
    const drip = new THREE.CapsuleGeometry(0.09, length, 6, 12)
    drip.translate(sx * (half - 0.02), top - 0.12 - 0.09 - length / 2, sz * (half - 0.02))
    parts.push(smooth(drip))
  }

  return mergeGeometries(parts)
}

/** Lumps of jam squeezed out between the sponge layers. */
export function createJamBlobs(count = 46, seed = 5) {
  const rand = mulberry32(seed)
  const half = CAKE.width / 2 + 0.04
  const items = []
  for (let i = 0; i < count; i++) {
    const side = i % 4
    const t = (rand() - 0.5) * CAKE.width * 0.96
    const x = side < 2 ? t : (side === 2 ? 1 : -1) * half
    const z = side < 2 ? (side === 0 ? 1 : -1) * half : t
    items.push({
      position: [x, CAKE.fillingY + (rand() - 0.5) * 0.1, z],
      scale: 0.04 + rand() * 0.055,
    })
  }
  return items
}

/** Rolled chocolate shaving: two nested open cylinder shells. */
export function createChocolateCurlGeometry() {
  const outer = new THREE.CylinderGeometry(0.085, 0.085, 0.5, 22, 1, true, 0, Math.PI * 1.75)
  const inner = new THREE.CylinderGeometry(0.055, 0.055, 0.5, 18, 1, true, 1.2, Math.PI * 1.5)
  return mergeGeometries([outer, inner])
}

/** A few irregular extruded chocolate shards. */
export function createChocolateShardGeometries(variants = 4, seed = 9) {
  const rand = mulberry32(seed)
  const result = []
  for (let v = 0; v < variants; v++) {
    const shape = new THREE.Shape()
    const points = 5 + Math.floor(rand() * 3)
    for (let i = 0; i < points; i++) {
      const a = (i / points) * Math.PI * 2 + (rand() - 0.5) * 0.5
      const r = 0.11 + rand() * 0.11
      const x = Math.cos(a) * r * 1.3
      const y = Math.sin(a) * r
      if (i === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    }
    shape.closePath()
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 2,
    })
    g.center()
    result.push(g)
  }
  return result
}

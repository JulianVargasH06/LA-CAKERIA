import { useCallback, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  CAKE,
  createChocolateCurlGeometry,
  createFillingGeometry,
  createGlazeGeometry,
  createJamBlobs,
  createSpongeGeometry,
} from './cakeGeometry'
import { getRaspberryGeometry, getRaspberryMaterial } from './raspberryGeometry'
import { getSpongeTextures } from './textures'

const TOP_BERRIES = [
  { position: [-0.42, 0.13, -0.28], rotation: [0.25, 0.4, -0.15], scale: 0.44 },
  { position: [0.38, 0.13, -0.5], rotation: [-0.2, 1.2, 0.2], scale: 0.42 },
  { position: [0.52, 0.12, 0.34], rotation: [0.15, 2.1, 0.25], scale: 0.4 },
  { position: [-0.3, 0.12, 0.52], rotation: [-0.3, 0.8, -0.2], scale: 0.38 },
  { position: [0.06, 0.32, 0.02], rotation: [0.9, 0.2, 0.5], scale: 0.4 },
]

const TOP_CURLS = [
  { position: [-0.05, 0.12, -0.7], rotation: [Math.PI / 2, 0, 0.6] },
  { position: [-0.7, 0.14, 0.15], rotation: [Math.PI / 2.2, 0.3, -0.4] },
  { position: [0.7, 0.16, -0.1], rotation: [0.4, 0.2, Math.PI / 2.3] },
  { position: [0.1, 0.22, 0.62], rotation: [Math.PI / 2, 0.4, 1.9] },
  { position: [-0.22, 0.44, -0.12], rotation: [0.9, 0.6, 0.3] },
]

const tmpColor = new THREE.Color()

/**
 * Layered slab cake: two crumb sponges, a jam filling squeezed out at the
 * edges, a glossy glaze with drips and fruit / chocolate on top.
 *
 * `cake` comes from resolveCake() in src/data/cakeOptions.js. Colour changes
 * are eased frame by frame so the customizer feels fluid.
 */
export default function CakeModel({ cake, detail = 'high', shadows = false }) {
  const high = detail === 'high'
  const segments = high ? 8 : 4

  const geometries = useMemo(
    () => ({
      bottom: createSpongeGeometry(CAKE.bottom, 1.7, high ? 6 : 3),
      top: createSpongeGeometry(CAKE.top, 4.2, high ? 6 : 3),
      filling: createFillingGeometry(segments),
      glaze: createGlazeGeometry(segments),
      curl: createChocolateCurlGeometry(),
      blob: new THREE.IcosahedronGeometry(1, high ? 2 : 1),
      berry: getRaspberryGeometry(high ? 1 : 0),
    }),
    [high, segments],
  )
  const blobs = useMemo(() => createJamBlobs(high ? 46 : 24), [high])
  const sponge = getSpongeTextures(cake.sponge, high ? 512 : 256)

  // one material shared by the filling and the jam blobs, eased in useFrame
  const [fillingMat] = useState(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: cake.filling.color,
        roughness: cake.filling.roughness,
        clearcoat: 0.65,
        clearcoatRoughness: 0.25,
      }),
  )
  const [glazeMat] = useState(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: cake.glaze.color,
        roughness: cake.glaze.roughness,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
      }),
  )
  const [curlMat] = useState(
    () => new THREE.MeshStandardMaterial({ color: '#2e1209', roughness: 0.42, side: THREE.DoubleSide }),
  )
  const berries = useRef()
  const curls = useRef()

  // jam blobs are drawn as a single instanced mesh (one draw call instead of ~46)
  const placeBlobs = useCallback(
    (mesh) => {
      if (!mesh) return
      const m = new THREE.Matrix4()
      const q = new THREE.Quaternion()
      const p = new THREE.Vector3()
      const sc = new THREE.Vector3()
      blobs.forEach((b, i) => {
        p.set(...b.position)
        sc.set(b.scale * 1.3, b.scale * 0.8, b.scale * 1.3)
        mesh.setMatrixAt(i, m.compose(p, q, sc))
      })
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
    },
    [blobs],
  )

  useFrame((_, delta) => {
    const k = 1 - Math.exp(-delta * 6)
    for (const [mat, target] of [
      [fillingMat, cake.filling],
      [glazeMat, cake.glaze],
    ]) {
      mat.color.lerp(tmpColor.set(target.color), k)
      mat.roughness += (target.roughness - mat.roughness) * k
    }
    const show = (group, visible) => {
      if (!group) return
      const s = THREE.MathUtils.damp(group.scale.x, visible ? 1 : 0.001, 7, delta)
      group.scale.setScalar(s)
      group.visible = s > 0.01
    }
    show(berries.current, cake.decoration.raspberries)
    show(curls.current, cake.decoration.curls)
  })

  const berryMaterial = getRaspberryMaterial()

  return (
    <group>
      <mesh
        geometry={geometries.bottom}
        position-y={CAKE.base + CAKE.bottom / 2}
        receiveShadow={shadows}
      >
        <meshStandardMaterial
          map={sponge.map}
          bumpMap={sponge.bumpMap}
          bumpScale={2.4}
          roughness={0.92}
        />
      </mesh>

      <mesh
        geometry={geometries.filling}
        material={fillingMat}
        position-y={CAKE.fillingY}
        receiveShadow={shadows}
      />

      <instancedMesh
        ref={placeBlobs}
        args={[geometries.blob, fillingMat, blobs.length]}
        key={blobs.length}
      />

      <mesh
        geometry={geometries.top}
        position-y={CAKE.topY - CAKE.top / 2}
        receiveShadow={shadows}
      >
        <meshStandardMaterial
          map={sponge.map}
          bumpMap={sponge.bumpMap}
          bumpScale={2.4}
          roughness={0.92}
        />
      </mesh>

      <mesh
        geometry={geometries.glaze}
        material={glazeMat}
        castShadow={shadows}
        receiveShadow={shadows}
      />

      <group position-y={CAKE.surface}>
        <group ref={berries}>
          {TOP_BERRIES.map((b, i) => (
            <mesh
              key={i}
              geometry={geometries.berry}
              material={berryMaterial}
              position={b.position}
              rotation={b.rotation}
              scale={b.scale}
              castShadow={shadows}
            />
          ))}
        </group>
        <group ref={curls}>
          {TOP_CURLS.map((c, i) => (
            <mesh
              key={i}
              geometry={geometries.curl}
              material={curlMat}
              position={c.position}
              rotation={c.rotation}
              castShadow={shadows}
            />
          ))}
        </group>
      </group>
    </group>
  )
}

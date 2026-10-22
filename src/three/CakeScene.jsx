import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import CakeModel from './CakeModel'
import FloatingRaspberry from './FloatingRaspberry'
import FloatingChocolate from './FloatingChocolate'
import StudioLights from './StudioLights'
import { getShadowTexture } from './textures'
import { resolveCake, SIGNATURE_CAKE } from '../data/cakeOptions'

/*
 * Hero composition. Two transparent canvases share the same camera:
 *  - "back": raspberries and chocolate behind the headline (CSS-blurred)
 *  - "front": the cake and the ingredients in front of the headline
 * Positions are authored for a ~16:9 stage and squeezed horizontally on
 * narrower stages (see useStageScale).
 */

const DESKTOP = {
  cake: { position: [0.3, -0.25, 0], scale: 1.12 },
  front: {
    berries: [
      { position: [-2.75, 1.05, 1.4], scale: 0.5, speed: 0.75, phase: 0.2, spin: [0.22, 0.35, 0.05], scroll: [-0.8, 0.9, 0] },
      { position: [2.35, -1.45, 2.4], scale: 0.52, speed: 0.6, phase: 1.7, spin: [-0.15, 0.25, 0.18], scroll: [0.6, -0.4, 0.6] },
      { position: [-1.55, -1.75, 1.8], scale: 0.46, speed: 0.85, phase: 3.1, spin: [0.3, -0.2, 0.1], scroll: [-0.5, -0.7, 0] },
      { position: [1.5, 1.85, 0.8], scale: 0.4, speed: 0.95, phase: 4.4, spin: [0.1, 0.4, -0.2], scroll: [0.6, 1, 0] },
    ],
    chocolate: [
      { variant: 0, position: [2.75, 0.55, 1], scale: 1.1, speed: 0.7, phase: 0.4, spin: [0.4, 0.2, 0.3], scroll: [0.9, 0.3, 0] },
      { variant: 'curl', position: [-2.15, -0.3, 1.6], scale: 0.75, speed: 0.55, phase: 2.2, spin: [0.2, 0.5, 0.1], scroll: [-0.9, 0, 0] },
      { variant: 2, position: [-0.65, -2.05, 1.2], scale: 1, speed: 0.8, phase: 5.1, spin: [0.5, 0.1, 0.4], scroll: [-0.2, -0.8, 0] },
      { variant: 1, position: [3.1, -0.95, 0.4], scale: 0.9, speed: 0.65, phase: 3.6, spin: [0.3, 0.4, 0.2], scroll: [0.8, -0.3, 0] },
    ],
  },
  back: {
    berries: [
      { position: [3.3, 2.05, -3], scale: 0.62, speed: 0.5, phase: 0.9, spin: [0.12, 0.25, 0.08], scroll: [0.4, 0.8, 0] },
      { position: [-4.6, -0.6, -4.5], scale: 0.6, speed: 0.45, phase: 2.5, spin: [0.2, -0.15, 0.1], scroll: [-0.6, 0.4, 0] },
      { position: [-1.6, 2.6, -5], scale: 0.5, speed: 0.55, phase: 4.1, spin: [-0.1, 0.2, 0.15], scroll: [0, 0.9, 0] },
      { position: [5.2, -1.6, -5.5], scale: 0.55, speed: 0.4, phase: 5.6, spin: [0.15, 0.1, -0.12], scroll: [0.5, -0.4, 0] },
    ],
    chocolate: [
      { variant: 3, position: [1.2, 2.55, -2.5], scale: 1, speed: 0.6, phase: 1.1, spin: [0.3, 0.2, 0.3], scroll: [0.3, 0.6, 0] },
      { variant: 'curl', position: [-3.6, 1.7, -3], scale: 0.7, speed: 0.5, phase: 3.3, spin: [0.2, 0.4, 0.2], scroll: [-0.4, 0.5, 0] },
    ],
  },
}

const BACK_DPR = 0.45

const MOBILE = {
  cake: { position: [0, -0.15, 0], scale: 0.98 },
  front: {
    berries: [
      { position: [-1.35, 1.3, 1.2], scale: 0.4, speed: 0.7, phase: 0.2, spin: [0.18, 0.28, 0.05], scroll: [-0.4, 0.6, 0] },
      { position: [1.15, -1.45, 1.6], scale: 0.44, speed: 0.55, phase: 1.7, spin: [-0.12, 0.2, 0.15], scroll: [0.4, -0.3, 0] },
      { position: [1.5, 1.45, -0.6], scale: 0.36, speed: 0.6, phase: 3.5, spin: [0.1, 0.25, -0.1], scroll: [0.3, 0.6, 0] },
    ],
    chocolate: [
      { variant: 0, position: [-1.35, -1.25, 1], scale: 0.9, speed: 0.6, phase: 2.4, spin: [0.3, 0.2, 0.2], scroll: [-0.3, -0.4, 0] },
    ],
  },
  back: { berries: [], chocolate: [] },
}

/** Narrow stages squeeze X positions so floating elements stay on screen. */
function useStageScale(reference) {
  const aspect = useThree((s) => s.viewport.aspect)
  return Math.min(1, aspect / reference)
}

function squeeze(items, k) {
  return items.map((item) => ({
    ...item,
    position: [item.position[0] * k, item.position[1], item.position[2]],
  }))
}

function HeroCake({ layout, animate, detail, shadows }) {
  const group = useRef()
  const shadow = useRef()
  const cake = useMemo(() => resolveCake(SIGNATURE_CAKE), [])
  const shadowTexture = getShadowTexture()
  const [baseX, baseY] = layout.cake.position

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const progress = Math.min(window.scrollY / window.innerHeight, 1.2)
    const intro = animate ? Math.min(t / 1.6, 1) : 1
    const eased = 1 - Math.pow(1 - intro, 3)
    const pointer = animate ? state.pointer : { x: 0, y: 0 }

    const hover = animate ? Math.sin(t * 0.9) * 0.08 : 0
    const targetY = baseY + hover + (1 - eased) * -1.2 + progress * 0.6
    g.position.y = THREE.MathUtils.damp(g.position.y, targetY, 4, delta)
    g.position.x = baseX
    g.scale.setScalar(layout.cake.scale * (0.86 + 0.14 * eased))

    const sway = animate ? Math.sin(t * 0.32) * 0.16 : 0
    g.rotation.y = THREE.MathUtils.damp(
      g.rotation.y,
      -0.62 + sway + pointer.x * 0.35 + (1 - eased) * 0.8 + progress * 0.9,
      2.6,
      delta,
    )
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.42 - pointer.y * 0.12 + progress * 0.15, 2.6, delta)
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, 0.12 + pointer.x * -0.04, 2.6, delta)

    if (shadow.current) {
      const lift = g.position.y - baseY
      shadow.current.material.opacity = 0.55 - lift * 0.35
      shadow.current.scale.setScalar(3.6 + lift * 0.8)
    }
  })

  return (
    <>
      <group ref={group} position={layout.cake.position} rotation={[0.42, -0.62, 0.07]}>
        <CakeModel cake={cake} detail={detail} shadows={shadows} />
      </group>
      <mesh
        ref={shadow}
        position={[baseX, baseY - 1.95, -0.4]}
        rotation-x={-Math.PI / 2}
        scale={3.6}
      >
        <planeGeometry />
        <meshBasicMaterial map={shadowTexture} transparent depthWrite={false} opacity={0.55} />
      </mesh>
    </>
  )
}

function Layer({ layer, layout, animate, berryDetail, mobile }) {
  // the mobile layout is authored for a ~1:1 stage already
  const k = useStageScale(mobile ? 0.9 : layer === 'back' ? 1.6 : 1.75)
  const items = layout[layer]
  const berries = useMemo(() => squeeze(items.berries, k), [items, k])
  const chocolate = useMemo(() => squeeze(items.chocolate, k), [items, k])

  return (
    <>
      {berries.map((b, i) => (
        <FloatingRaspberry
          key={`b${i}`}
          {...b}
          detail={berryDetail}
          animate={animate}
          delay={0.5 + i * 0.18}
          rotation={[i * 1.1, i * 0.7, i * 0.4]}
        />
      ))}
      {chocolate.map((c, i) => (
        <FloatingChocolate
          key={`c${i}`}
          {...c}
          animate={animate}
          delay={0.8 + i * 0.15}
          rotation={[i * 0.9, i * 1.3, i * 0.5]}
        />
      ))}
    </>
  )
}

/**
 * @param {'front'|'back'} layer
 * @param {boolean} mobile     lighter layout and geometry
 * @param {boolean} animate    false when the user prefers reduced motion
 * @param {boolean} active     false when the hero is off screen (pauses rendering)
 * @param {React.RefObject} eventSource element that drives the pointer parallax
 */
export default function CakeScene({ layer = 'front', mobile = false, animate = true, active = true, eventSource }) {
  const [dpr, setDpr] = useState(mobile ? 1.5 : 1.75)
  const layout = mobile ? MOBILE : DESKTOP
  const back = layer === 'back'
  const shadows = !back && !mobile

  return (
    <Canvas
      className={`cake-scene cake-scene--${layer}`}
      // The back layer renders at low resolution on purpose: the browser's
      // upscaling gives it a soft, out-of-focus look without a CSS blur filter
      // (which would re-blur the whole layer on every frame).
      dpr={back ? BACK_DPR : [1, dpr]}
      shadows={shadows ? { type: THREE.PCFShadowMap } : false}
      frameloop={active && animate ? 'always' : 'demand'}
      camera={{ position: [0, 0, 9], fov: 30, near: 0.1, far: 40 }}
      gl={{ antialias: !back, alpha: true, powerPreference: 'high-performance' }}
      eventSource={eventSource}
      eventPrefix="client"
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping
        gl.toneMappingExposure = 1.05
      }}
      aria-hidden="true"
    >
      {!back && <PerformanceMonitor onDecline={() => setDpr(1)} />}
      <StudioLights shadows={shadows} />
      {layer === 'front' && (
        <HeroCake layout={layout} animate={animate} detail={mobile ? 'low' : 'high'} shadows={shadows} />
      )}
      <Layer layer={layer} layout={layout} animate={animate} berryDetail={mobile ? 0 : 1} mobile={mobile} />
    </Canvas>
  )
}

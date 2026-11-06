import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import CakeModel from './CakeModel'
import FloatingRaspberry from './FloatingRaspberry'
import StudioLights from './StudioLights'
import { getShadowTexture } from './textures'

function Turntable({ cake, animate, mobile }) {
  const group = useRef()
  useFrame((state, delta) => {
    if (!group.current || !animate) return
    group.current.rotation.y += delta * 0.18
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.06
  })
  return (
    <group ref={group} rotation={[0, -0.7, 0]}>
      <CakeModel cake={cake} detail={mobile ? 'low' : 'high'} shadows={!mobile} />
    </group>
  )
}

/**
 * Cake for the customizer: drag to rotate, materials update live.
 * `interactive={false}` is the home page preview (turntable only, no controls).
 */
export default function CustomizerScene({ cake, animate = true, active = true, mobile = false, interactive = true }) {
  return (
    <Canvas
      className="cake-scene"
      dpr={[1, mobile ? 1.5 : 1.75]}
      shadows={mobile ? false : { type: THREE.PCFShadowMap }}
      frameloop={active ? 'always' : 'demand'}
      camera={{ position: [0, 2.8, 8.4], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping
      }}
    >
      <StudioLights shadows={!mobile} />
      <Turntable cake={cake} animate={animate} mobile={mobile} />
      {cake.decoration.raspberries && (
        <>
          <FloatingRaspberry position={[-1.45, 1.05, 0.6]} scale={0.38} speed={0.7} phase={1} animate={animate} detail={mobile ? 0 : 1} />
          <FloatingRaspberry position={[1.4, -0.55, 0.9]} scale={0.32} speed={0.6} phase={3} animate={animate} detail={mobile ? 0 : 1} />
        </>
      )}
      <mesh position={[0, -1.25, 0]} rotation-x={-Math.PI / 2} scale={4.2}>
        <planeGeometry />
        <meshBasicMaterial map={getShadowTexture()} transparent depthWrite={false} opacity={0.6} />
      </mesh>
      {interactive && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.05}
          enableRotate={!mobile}
          rotateSpeed={0.6}
        />
      )}
    </Canvas>
  )
}

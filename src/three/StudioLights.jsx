import { Environment, Lightformer } from '@react-three/drei'

/**
 * Product-photography lighting: warm key light, pink rim light and a
 * locally generated studio environment (no HDR download) that gives the
 * ganache and the raspberries their glossy highlights.
 */
export default function StudioLights({ shadows = false }) {
  return (
    <>
      <ambientLight intensity={0.35} color="#ffe9d6" />
      <directionalLight
        position={[-4, 6, 5]}
        intensity={2.6}
        color="#fff1e0"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-2.5}
        shadow-camera-right={2.5}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-2.5}
        shadow-camera-near={1}
        shadow-camera-far={20}
      />
      <directionalLight position={[5, 2, -4]} intensity={2.2} color="#ffb2a6" />
      <pointLight position={[0, -3, 3]} intensity={6} distance={10} color="#ffd9b0" />

      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 2]} scale={[8, 4, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={2} color="#fff4e0" position={[-5, 1, 3]} scale={[3, 6, 1]} rotation-y={Math.PI / 3} />
        <Lightformer form="rect" intensity={1.6} color="#ffa29d" position={[5, 1, -2]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2.5} />
        <Lightformer form="circle" intensity={2} color="#fbf4d0" position={[0, 0, 6]} scale={3} />
      </Environment>
    </>
  )
}

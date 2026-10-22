import { getRaspberryGeometry, getRaspberryMaterial } from './raspberryGeometry'
import { useFloat } from './useFloat'

/**
 * A single procedural raspberry floating in the air.
 * Accepts every option of useFloat (position, speed, phase, spin, scroll…).
 */
export default function FloatingRaspberry({ rotation = [0, 0, 0], detail = 1, ...float }) {
  const ref = useFloat(float)
  return (
    <group ref={ref} position={float.position} rotation={rotation}>
      <mesh geometry={getRaspberryGeometry(detail)} material={getRaspberryMaterial()} />
    </group>
  )
}

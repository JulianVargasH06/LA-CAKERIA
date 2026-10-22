import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const easeOutBack = (x) => {
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

/**
 * Organic "suspended in the air" motion for a group:
 * two layered sine waves on Y, a slow drift on X, continuous rotation on
 * several axes, an entrance pop and an optional reaction to page scroll.
 * Each instance gets its own speed/phase so nothing moves in sync.
 */
export function useFloat({
  position,
  scale = 1,
  speed = 1,
  amplitude = 0.12,
  phase = 0,
  spin = [0.2, 0.3, 0.1],
  delay = 0,
  scroll = [0, 0, 0],
  animate = true,
}) {
  const ref = useRef()

  useFrame((state, delta) => {
    const g = ref.current
    if (!g) return
    const t = state.clock.elapsedTime

    const appear = animate ? Math.min(Math.max((t - delay) / 1.1, 0), 1) : 1
    g.scale.setScalar(scale * (appear === 0 ? 0.0001 : easeOutBack(appear)))

    const progress = Math.min(window.scrollY / window.innerHeight, 1.2)
    const w = t * speed + phase
    const bob = animate
      ? Math.sin(w) * amplitude + Math.sin(w * 0.43 + 1.3) * amplitude * 0.45
      : 0
    const sway = animate ? Math.cos(w * 0.6) * amplitude * 0.35 : 0

    g.position.set(
      position[0] + sway + scroll[0] * progress,
      position[1] + bob + scroll[1] * progress,
      position[2] + scroll[2] * progress,
    )

    if (animate) {
      g.rotation.x += spin[0] * delta
      g.rotation.y += spin[1] * delta
      g.rotation.z += spin[2] * delta
    }
  })

  return ref
}

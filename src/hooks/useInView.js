import { useEffect, useState } from 'react'

/** True while the element is (roughly) on screen. Used to pause WebGL rendering. */
export function useInView(ref, rootMargin = '100px') {
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])
  return inView
}

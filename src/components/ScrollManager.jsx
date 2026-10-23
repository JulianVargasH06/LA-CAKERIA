import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router'

/**
 * Client-side navigation does not reset the scroll position by itself:
 * - new page → start at the top
 * - URL with a hash (/#destacados) → scroll to that section once it exists
 * - back / forward (POP) → leave the browser's own restoration alone
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (hash) {
      let tries = 0
      const tryScroll = () => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)))
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else if (tries++ < 20) timer = setTimeout(tryScroll, 50)
      }
      let timer = setTimeout(tryScroll, 0)
      return () => clearTimeout(timer)
    }
    if (navigationType !== 'POP') window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash, navigationType])

  return null
}

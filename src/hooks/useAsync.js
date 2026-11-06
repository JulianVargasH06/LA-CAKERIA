import { useEffect, useRef, useState } from 'react'

/**
 * Runs an async loader (e.g. an API call) and tracks its state:
 *   const { status, data, error, retry } = useAsync((signal) => fetchRecipe(id, signal), id)
 * status: 'loading' | 'success' | 'error'. The request is aborted when the
 * component unmounts or `key` changes; `retry()` runs it again.
 */
export function useAsync(load, key) {
  const loadRef = useRef(load)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ requestKey: null, status: 'loading', data: null, error: null })
  const requestKey = `${key}#${attempt}`

  useEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    const controller = new AbortController()
    loadRef.current(controller.signal).then(
      (data) => setResult({ requestKey, status: 'success', data, error: null }),
      (error) => {
        if (!controller.signal.aborted) setResult({ requestKey, status: 'error', data: null, error })
      },
    )
    return () => controller.abort()
  }, [requestKey])

  // until the current request settles, report "loading" (no stale data from a previous key)
  const current = result.requestKey === requestKey ? result : { status: 'loading', data: null, error: null }
  return { ...current, retry: () => setAttempt((n) => n + 1) }
}

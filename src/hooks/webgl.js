let supported

/** Detects WebGL once per page load. */
export function hasWebGL() {
  if (supported !== undefined) return supported
  try {
    const canvas = document.createElement('canvas')
    supported = Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    )
  } catch {
    supported = false
  }
  return supported
}

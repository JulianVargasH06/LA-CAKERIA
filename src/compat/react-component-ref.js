/**
 * React 19 compatibility shim for `@fluentui/react-component-ref`.
 *
 * Semantic UI React 2.x wraps Button, Modal, Dropdown, TextArea, Checkbox…
 * in <Ref>, which falls back to `ReactDOM.findDOMNode` — an API removed in
 * React 19. Vite aliases the original package to this file (vite.config.js).
 *
 * - Host elements (`<div>`, `<button>`) and forwardRef components receive
 *   the ref directly through cloneElement (refs are plain props in React 19).
 * - Anything else is wrapped in a `display: contents` span and the ref
 *   receives the span's first element child, without affecting layout.
 */
import {
  Children,
  cloneElement,
  createElement,
  isValidElement,
} from 'react'

const FORWARD_REF = Symbol.for('react.forward_ref')

export function handleRef(ref, node) {
  if (typeof ref === 'function') {
    ref(node)
    return
  }
  if (ref !== null && typeof ref === 'object') {
    ref.current = node
  }
}

export function isRefObject(ref) {
  return (
    ref !== null &&
    typeof ref === 'object' &&
    Object.prototype.hasOwnProperty.call(ref, 'current')
  )
}

function canTakeRef(child) {
  if (!isValidElement(child)) return false
  const { type } = child
  return typeof type === 'string' || type?.$$typeof === FORWARD_REF
}

export function Ref({ children, innerRef, ...rest }) {
  const child = Children.only(children)
  const childRef = isValidElement(child) ? child.props.ref : undefined

  const mergedRef = (node) => {
    handleRef(childRef, node)
    handleRef(innerRef, node)
  }

  const wrapperRef = (node) => handleRef(innerRef, node ? node.firstElementChild : null)

  const hasRest = Object.keys(rest).length > 0

  if (canTakeRef(child)) {
    return cloneElement(child, { ...rest, ref: mergedRef })
  }

  return createElement(
    'span',
    { ref: wrapperRef, style: { display: 'contents' } },
    hasRest && isValidElement(child) ? cloneElement(child, rest) : child,
  )
}

export const RefFindNode = Ref
export const RefForward = Ref

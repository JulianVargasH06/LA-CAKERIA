import { Button } from 'semantic-ui-react'
import { FlowerIcon } from './Icons'

/** Loading placeholder: pulsing organic shapes while the API answers. */
export function ApiLoading({ label = 'Cargando…', count = 8 }) {
  return (
    <div className="api-loading" role="status">
      <span className="sr-only">{label}</span>
      <div className="api-loading__grid" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className="api-loading__item" style={{ animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>
    </div>
  )
}

/** Error message with a retry button. */
export function ApiError({ title, error, onRetry }) {
  return (
    <div className="menu__empty api-error" role="alert">
      <FlowerIcon size={36} />
      <h2>{title}</h2>
      <p>
        Revisa tu conexión a internet e inténtalo de nuevo.
        {error?.message && <small className="api-error__detail">Detalle: {error.message}</small>}
      </p>
      <Button className="ck-btn ck-btn--dark" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  )
}

/** No results (empty response or no matches for a search). */
export function ApiEmpty({ title, text, children }) {
  return (
    <div className="menu__empty" role="status">
      <FlowerIcon size={36} />
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {children}
    </div>
  )
}

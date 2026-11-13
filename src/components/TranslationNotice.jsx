const ENGINES = {
  device: 'traductor integrado del navegador',
  mymemory: 'MyMemory',
  cache: 'traducción guardada en este navegador',
}

/**
 * Status of the automatic Spanish translation of TheMealDB content, with a
 * switch to show the original English text and a retry when it fails.
 */
export default function TranslationNotice({ translation, showOriginal, onToggle }) {
  const { status, data: engine, error, retry } = translation

  let message
  if (showOriginal) message = 'Mostrando el texto original en inglés, tal como lo publica TheMealDB.'
  else if (status === 'loading') message = 'Traduciendo al español…'
  else if (status === 'error')
    message = `No pudimos traducir en este momento (${error?.message ?? 'error de conexión'}). Se muestra el texto original en inglés.`
  else message = `Traducción automática al español (${ENGINES[engine] ?? engine}). Puede contener imprecisiones.`

  return (
    <div className={`translation-notice ${status === 'error' && !showOriginal ? 'is-error' : ''}`} role="status">
      <span className="translation-notice__text">{message}</span>
      <span className="translation-notice__actions">
        {status === 'error' && !showOriginal && (
          <button type="button" onClick={retry}>
            Reintentar traducción
          </button>
        )}
        {status !== 'error' && (
          <button type="button" onClick={onToggle} aria-pressed={showOriginal}>
            {showOriginal ? 'Ver en español' : 'Ver original en inglés'}
          </button>
        )}
      </span>
    </div>
  )
}

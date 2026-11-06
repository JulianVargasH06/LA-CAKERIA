import { FlowerIcon } from './Icons'

/** Shown while a code-split page is loading. */
export default function PageLoader() {
  return (
    <div className="page-loader" role="status">
      <FlowerIcon size={34} />
      <span className="sr-only">Cargando…</span>
    </div>
  )
}

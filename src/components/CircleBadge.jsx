import { useId } from 'react'
import { FlowerIcon } from './Icons'

/** Circular rotating stamp ("Horneado hoy · Ingredientes premium"). */
export default function CircleBadge({ text = 'Horneado hoy · Ingredientes premium · ', className = '' }) {
  const id = useId()
  return (
    <div className={`circle-badge ${className}`} aria-hidden="true">
      <svg viewBox="0 0 120 120" className="circle-badge__ring">
        <defs>
          <path id={id} d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1 -92 0" />
        </defs>
        <text>
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </svg>
      <span className="circle-badge__core">
        <FlowerIcon size={20} />
      </span>
    </div>
  )
}

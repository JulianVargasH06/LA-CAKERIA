import { FlowerIcon } from './Icons'

const WORDS = [
  'Horneado cada mañana',
  'Cacao de origen 70 %',
  'Frambuesas de temporada',
  'Sin conservantes',
  'Hecho a mano',
]

export default function Marquee() {
  const row = WORDS.flatMap((w) => [w, '✦'])
  return (
    <div className="marquee" aria-label={WORDS.join(', ')}>
      <div className="marquee__track" aria-hidden="true">
        {[0, 1].map((copy) => (
          <span className="marquee__group" key={copy}>
            {row.map((w, i) =>
              w === '✦' ? (
                <FlowerIcon key={i} size={22} />
              ) : (
                <span key={i}>{w}</span>
              ),
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

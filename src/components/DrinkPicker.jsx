import { useId } from 'react'
import { Button } from 'semantic-ui-react'
import { DRINKS } from '../data/drinks'

/**
 * Chips to choose the drink included with a product. Reused on the product
 * page, in the cart and in the customizer (`chipClass` adapts the chip style
 * to light or dark backgrounds). Pass `label={null}` when a surrounding
 * <legend> already names the group.
 */
export default function DrinkPicker({ value, onChange, chipClass = 'ck-size', label = 'Bebida incluida', compact = false }) {
  const labelId = useId()
  return (
    <div className={`drink-picker ${compact ? 'drink-picker--compact' : ''}`}>
      {label && (
        <span className="drink-picker__label" id={labelId}>
          {label} <small>sin costo</small>
        </span>
      )}
      <div
        className="drink-picker__options"
        role="group"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : 'Bebida incluida'}
      >
        {DRINKS.map((drink) => {
          const active = drink.key === value
          return (
            <Button
              key={drink.key}
              type="button"
              className={`${chipClass} ck-drink ${active ? 'is-active' : ''}`}
              aria-pressed={active}
              onClick={() => onChange(drink.key)}
            >
              {drink.label}
              {!compact && <small>{drink.note}</small>}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

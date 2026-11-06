/**
 * Drink included with every product, at no extra charge (prices are not
 * affected). The customer picks one per product. Edit freely.
 */
export const DRINKS = [
  { key: 'cafe', label: 'Café', note: 'de la casa' },
  { key: 'chocolate', label: 'Chocolate', note: 'caliente' },
  { key: 'te', label: 'Té', note: 'de frutos rojos' },
  { key: 'jugo', label: 'Jugo natural', note: 'de temporada' },
  { key: 'malteada', label: 'Malteada', note: 'de vainilla' },
]

export const DEFAULT_DRINK = DRINKS[0].key

const byKey = Object.fromEntries(DRINKS.map((d) => [d.key, d]))

export const drinkName = (key) => {
  const drink = byKey[key] ?? byKey[DEFAULT_DRINK]
  return `${drink.label} ${drink.note}`
}

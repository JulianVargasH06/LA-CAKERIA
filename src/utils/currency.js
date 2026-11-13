/**
 * The single price format of the site: Colombian pesos.
 * Every component (catalog, product page, cart, customizer, chatbot) formats
 * prices through these helpers, so the same amount always looks the same.
 */
const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  // minimumFractionDigits is set too: some browsers reject a maximum lower than COP's default minimum (2)
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** 145000 → "$ 145.000" — for compact price stamps that print "COP" on their own line. */
export const formatCOPAmount = (value) => COP.format(value)

/** 145000 → "$ 145.000 COP" */
export const formatCOP = (value) => `${COP.format(value)} COP`

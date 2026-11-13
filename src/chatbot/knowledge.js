/**
 * What the assistant knows about La Cakería. Everything is derived from the
 * project's own data files (products, drinks, customizer options, contact
 * details) — nothing here invents prices, products or policies. The only
 * hand-written parts are synonyms that help recognise what customers type.
 */
import { BASE_PRICE, CUSTOM_SIZES, DECORATIONS, FILLINGS, GLAZES, SPONGES } from '../data/cakeOptions'
import { DRINKS, drinkName } from '../data/drinks'
import { CATEGORIES, CURRENCY, PRODUCTS } from '../data/products'
import { SITE } from '../data/site'

export { CATEGORIES, CURRENCY, DRINKS, drinkName, PRODUCTS, SITE }

/** Lower-case, no accents, no punctuation, single spaces. */
export function normalize(text) {
  return ` ${String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9$ñ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `
}

/** Whole-phrase test on normalized text (both padded with spaces). */
export const hasPhrase = (text, phrase) => text.includes(` ${normalize(phrase).trim()} `)
export const hasAny = (text, phrases) => phrases.some((p) => hasPhrase(text, p))

/* ---------- products ---------- */

// Extra ways customers refer to each product (the product name is always included).
const ALIASES = {
  'dark-chocolate-raspberry': ['dark chocolate', 'chocolate y frambuesa', 'chocolate con frambuesa', 'torta de la casa', 'firma de la casa', 'dark chocolate raspberry'],
  'red-velvet': ['red velvet', 'terciopelo rojo', 'torta red velvet'],
  'cheesecake-frutos-rojos': ['cheesecake', 'cheese cake', 'tarta de queso', 'pastel de queso', 'torta de queso'],
  'cupcakes-artesanales': ['cupcake', 'cupcakes', 'magdalenas', 'ponquecitos'],
  'tarta-temporada': ['tarta de temporada', 'tarta de frutas', 'tarta de fruta'],
  'torta-trufa-chocolate': ['trufa', 'torta trufa', 'trufa de chocolate', 'torta de chocolate'],
  'mini-red-velvet': ['mini red velvet', 'mini torta', 'red velvet individual', 'red velvet pequena'],
  'tiramisu-de-la-casa': ['tiramisu', 'tiramisu de la casa'],
  'tartaletas-frutos-rojos': ['tartaleta', 'tartaletas'],
  'tarta-limon-frutos-rojos': ['tarta de limon', 'limon y frutos rojos', 'pie de limon'],
  'torta-zanahoria': ['zanahoria', 'torta de zanahoria', 'carrot cake', 'pastel de zanahoria'],
  'macarons-frambuesa': ['macaron', 'macarons', 'macaroon', 'macarrones'],
}

const productPhrases = PRODUCTS.map((p) => ({
  id: p.id,
  phrases: [p.name, ...(ALIASES[p.id] ?? [])].map((a) => normalize(a).trim()),
}))

/** Products named in the text. Longest match wins ("mini red velvet" beats "red velvet"). */
export function findProducts(text) {
  const matches = []
  for (const { id, phrases } of productPhrases) {
    for (const phrase of phrases) {
      const at = text.indexOf(` ${phrase} `)
      if (at >= 0) matches.push({ id, start: at, end: at + phrase.length + 1 })
    }
  }
  const kept = matches.filter(
    (m) => !matches.some((o) => o !== m && o.start <= m.start && o.end >= m.end && o.end - o.start > m.end - m.start),
  )
  return [...new Set(kept.sort((a, b) => a.start - b.start).map((m) => m.id))]
}

export const productById = (id) => PRODUCTS.find((p) => p.id === id)

/** How many people a size serves: "12 porciones" → 12, "Caja x6" → 6, "Unidad" → 1. */
export function servings(label) {
  const n = label.match(/\d+/)
  if (n) return Number(n[0])
  return /unidad|porcion/i.test(label) ? 1 : null
}

export const priceRange = (p) => {
  const prices = p.sizes.map((s) => s.price)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

export const money = (n) => `${CURRENCY}${n}`

/** Text used to match flavours against a product (only its real fields). */
export const productText = (p) => normalize(`${p.name} ${p.tagline} ${p.description} ${p.tags.join(' ')} ${p.unit}`)

/* ---------- flavours, occasions, categories ---------- */

// Words a customer may use → words that appear in our product descriptions.
export const FLAVORS = {
  chocolate: { says: ['chocolate', 'chocolatoso', 'cacao', 'trufa'], matches: ['chocolate', 'cacao', 'trufada'] },
  frutosRojos: { says: ['frutos rojos', 'frambuesa', 'frambuesas', 'fresa', 'fresas', 'berries', 'arandanos', 'moras'], matches: ['frutos rojos', 'frambuesa'] },
  fruta: { says: ['fruta', 'frutas', 'frutal', 'fresco', 'fresca', 'ligero', 'ligera'], matches: ['fruta', 'frutos rojos', 'limon', 'frambuesa'] },
  limon: { says: ['limon', 'citrico', 'acido', 'acida'], matches: ['limon'] },
  queso: { says: ['queso', 'queso crema', 'cremoso', 'cremosa', 'mascarpone'], matches: ['queso crema', 'mascarpone', 'cremoso', 'cheesecake'] },
  cafe: { says: ['sabor a cafe', 'con cafe', 'cafe'], matches: ['cafe'] },
  vainilla: { says: ['vainilla'], matches: ['vainilla'] },
  frutosSecos: { says: ['nueces', 'nuez', 'almendra', 'almendras', 'frutos secos', 'canela', 'especiado', 'especias'], matches: ['nueces', 'almendra', 'canela'] },
}

export const OCCASIONS = {
  cumpleanos: ['cumpleanos', 'cumple', 'cumpleano', 'happy birthday'],
  regalo: ['regalo', 'regalar', 'obsequio', 'sorpresa', 'detalle', 'para regalar', 'dia de la madre', 'san valentin', 'aniversario'],
  celebracion: ['celebracion', 'celebrar', 'fiesta', 'reunion', 'boda', 'bautizo', 'graduacion', 'evento', 'familia', 'navidad', 'invitados'],
  antojo: ['antojo', 'antojito', 'capricho', 'merienda', 'para mi', 'algo pequeno', 'algo rapido', 'individual', 'cafe de la tarde', 'algo dulce'],
}

export const CATEGORY_WORDS = {
  tortas: ['tortas', 'torta', 'pasteles', 'tortas enteras'],
  individuales: ['individuales', 'individual', 'porciones individuales', 'piezas individuales'],
  temporada: ['temporada', 'de temporada', 'edicion limitada'],
}

/* ---------- other facts ---------- */

export const CUSTOM = {
  base: BASE_PRICE,
  groups: [
    { title: 'Bizcocho', options: Object.values(SPONGES) },
    { title: 'Relleno', options: Object.values(FILLINGS) },
    { title: 'Cobertura', options: Object.values(GLAZES) },
    { title: 'Decoración', options: Object.values(DECORATIONS) },
  ],
  sizes: CUSTOM_SIZES.map((s) => ({ label: s.label, price: Math.round(BASE_PRICE * s.factor) })),
}

export const DRINK_LIST = DRINKS.map((d) => drinkName(d.key))

const numberWords = {
  uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18,
  diecinueve: 19, veinte: 20, veinticinco: 25, treinta: 30, cuarenta: 40, cincuenta: 50,
}
const toNumber = (word) => (/^\d+$/.test(word) ? Number(word) : numberWords[word])

/** "para 12 personas", "somos doce", "unos 15 invitados" → 12 / 15. */
export function parsePeople(text) {
  const m =
    text.match(/ (\d+|[a-z]+) (personas|persona|invitados|comensales|porciones|personitas|ninos|adultos) /) ||
    // "para 12", "somos doce" — but not "para una fiesta"
    text.match(/ (?:para|somos|seremos|seriamos) (\d+|(?!una? )[a-z]+) /)
  const n = m && toNumber(m[1])
  return n && n > 1 && n < 500 ? n : null
}

/** "menos de 30", "hasta $40", "presupuesto de 25", "maximo 20 dolares" → 30 / 40 / 25 / 20. */
export function parseBudget(text) {
  const m =
    text.match(/ (?:menos de|hasta|maximo|max|no mas de|presupuesto de|presupuesto|por debajo de) \$? ?(\d+|[a-z]+)( [a-z]+)?/) ||
    text.match(/ \$ ?(\d+)()/)
  if (!m) return null
  // "hasta 12 personas" is a number of people, not money
  if (/^ (personas|persona|invitados|comensales|porciones)$/.test(m[2] ?? '')) return null
  const n = toNumber(m[1])
  return n && n > 0 ? n : null
}

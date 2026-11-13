/**
 * La Cakería assistant — rule/intent based (no AI model, no external calls).
 *
 *   const { message, context } = reply('¿qué me recomiendas para un cumpleaños de 12?', context)
 *
 * 1. The text is normalized and scanned for intents (price, recommend, order…)
 *    and entities (products, flavours, occasion, people, budget).
 * 2. A handler builds the answer only from src/data (via knowledge.js).
 * 3. `context` remembers the last products discussed, so follow-ups such as
 *    "¿y cuánto cuesta?" or "¿qué bebida trae?" refer to them.
 * When a question is outside what the project knows (shipping, payments,
 * allergens, stock…) the assistant says so and points to the contact details.
 *
 * A message is { text: string[], products: {id, note}[], actions: Action[], suggestions: string[] }
 * Action: { type: 'link', to, label } | { type: 'cart', label }
 */
import {
  CATEGORIES,
  CATEGORY_WORDS,
  CUSTOM,
  DRINK_LIST,
  FLAVORS,
  findProducts,
  hasAny,
  hasPhrase,
  money,
  normalize,
  OCCASIONS,
  parseBudget,
  parsePeople,
  priceRange,
  productById,
  PRODUCTS,
  productText,
  servings,
  SITE,
} from './knowledge'

/* ---------- intent vocabulary ---------- */
const INTENTS = {
  greet: ['hola', 'holi', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'saludos', 'que tal'],
  thanks: ['gracias', 'muchas gracias', 'mil gracias', 'te agradezco'],
  bye: ['adios', 'chao', 'chau', 'hasta luego', 'nos vemos', 'bye'],
  help: ['ayuda', 'que puedes hacer', 'que sabes hacer', 'como funcionas', 'en que me ayudas', 'quien eres', 'eres un bot', 'eres humano', 'como te llamas'],
  catalog: ['menu', 'catalogo', 'productos', 'que tienen', 'que venden', 'que ofrecen', 'carta', 'que hay', 'todos los productos', 'opciones', 'lista'],
  price: ['precio', 'precios', 'cuesta', 'cuestan', 'cuanto vale', 'cuanto valen', 'valor', 'costo', 'cuanto es', 'cuanto sale', 'cuanto'],
  cheap: ['barato', 'barata', 'economico', 'economica', 'mas barato', 'menor precio', 'accesible'],
  expensive: ['caro', 'cara', 'mas caro', 'mas cara', 'premium', 'mayor precio'],
  sizes: ['tamano', 'tamanos', 'porciones', 'porcion', 'cuantas personas', 'para cuantos', 'grande', 'pequena', 'pequeno', 'cajas', 'caja'],
  // "te" alone is also a pronoun ("¿qué te recomiendo?"), so tea only counts in phrases
  drink: ['bebida', 'bebidas', 'tomar', 'beber', 'cafe', 'un te', 'el te', 'te de', 'hay te', 'tienen te', 'jugo', 'malteada', 'chocolate caliente', 'acompanamiento', 'acompanar'],
  recommend: ['recomienda', 'recomiendas', 'recomendar', 'recomendacion', 'sugieres', 'sugerencia', 'sugerir', 'que me das', 'que pido', 'cual pido', 'cual me', 'cual es mejor', 'que me aconsejas', 'aconsejas', 'ideal', 'quiero algo', 'busco algo', 'algo para', 'no se que', 'ayudame a elegir', 'elegir', 'favorito', 'favoritos', 'tu favorito', 'que te gusta', 'cual te gusta', 'que te gusta mas', 'mas vendido', 'mas pedido', 'popular'],
  order: ['pedido', 'pedidos', 'pedir', 'comprar', 'compra', 'ordenar', 'encargar', 'encargo', 'carrito', 'como compro', 'como pido', 'reservar', 'apartar', 'agregar al carrito'],
  custom: ['personalizar', 'personalizada', 'personalizado', 'personaliza', 'disenar', 'diseno', 'a mi gusto', 'mi propia torta', 'armar', 'configurar', 'configurador', 'torta personalizada', 'crear mi torta'],
  contact: ['contacto', 'contactar', 'telefono', 'llamar', 'correo', 'email', 'mail', 'whatsapp', 'direccion', 'ubicacion', 'donde estan', 'donde quedan', 'local', 'tienda', 'redes', 'instagram', 'facebook', 'pinterest'],
  hours: ['horario', 'horarios', 'hora', 'abren', 'cierran', 'atienden', 'abierto', 'dias de atencion'],
  recipes: ['receta', 'recetas', 'inspiracion', 'themealdb', 'como se hace', 'como preparar', 'cocinar', 'hornear en casa'],
  about: ['historia', 'quienes son', 'quienes somos', 'nosotros', 'sobre ustedes', 'artesanal', 'filosofia', 'la cakeria'],
}

// Questions the project has no information about: answer honestly, never invent.
const UNKNOWN_TOPICS = {
  delivery: { words: ['domicilio', 'envio', 'envios', 'entregan', 'entrega', 'delivery', 'despacho', 'llevan', 'recoger', 'retirar', 'mandan'], topic: 'los envíos, entregas o retiros' },
  payment: { words: ['pago', 'pagar', 'tarjeta', 'efectivo', 'transferencia', 'nequi', 'daviplata', 'paypal', 'medios de pago', 'formas de pago'], topic: 'los medios de pago' },
  allergens: { words: ['alergia', 'alergias', 'alergico', 'alergica', 'alergeno', 'alergenos', 'gluten', 'celiaco', 'vegano', 'vegana', 'lactosa', 'sin azucar', 'diabetico', 'diabetica', 'sin huevo', 'keto'], topic: 'alérgenos o dietas especiales' },
  stock: { words: ['disponible', 'disponibilidad', 'stock', 'quedan', 'hay hoy', 'tienen hoy', 'agotado', 'para hoy', 'para manana'], topic: 'la disponibilidad del día' },
  promo: { words: ['descuento', 'descuentos', 'promocion', 'promociones', 'promo', 'oferta', 'ofertas', 'cupon', 'codigo'], topic: 'promociones o descuentos' },
  time: { words: ['cuanto tiempo', 'con cuanta anticipacion', 'anticipacion', 'cuanto demoran', 'cuanto tardan', 'tiempo de preparacion'], topic: 'los tiempos de preparación o anticipación' },
}

const FOLLOW_UP = ['ese', 'esa', 'eso', 'esos', 'esas', 'este', 'esta', 'esto', 'el primero', 'la primera', 'y cuanto', 'y que', 'tambien', 'de ese', 'de esa', 'lo', 'la']

/* ---------- helpers ---------- */
const pick = (options, seed) => options[seed % options.length]
const message = (text, extra = {}) => ({ text: [].concat(text), products: [], actions: [], suggestions: [], ...extra })
const link = (to, label) => ({ type: 'link', to, label })

const sizesLine = (p) => p.sizes.map((s) => `${s.label}: ${money(s.price)}`).join(' · ')
const fromPrice = (p) => `desde ${money(priceRange(p).min)}`

function detect(text) {
  const intents = new Set(Object.entries(INTENTS).filter(([, words]) => hasAny(text, words)).map(([k]) => k))
  // "chocolate" alone is a flavour, not the hot-chocolate drink
  if (intents.has('drink') && !hasAny(text, ['bebida', 'bebidas', 'tomar', 'beber', 'jugo', 'malteada', 'chocolate caliente', 'acompanamiento', 'acompanar', 'un te', 'el te', 'te de', 'hay te', 'tienen te', 'cafe'])) {
    intents.delete('drink')
  }
  const unknown = Object.entries(UNKNOWN_TOPICS).filter(([, t]) => hasAny(text, t.words)).map(([k]) => k)
  const flavors = []
  const excluded = []
  for (const [key, f] of Object.entries(FLAVORS)) {
    const negated = f.says.some((w) => hasPhrase(text, `sin ${w}`) || hasPhrase(text, `no ${w}`) || hasPhrase(text, `que no tenga ${w}`) || hasPhrase(text, `no me gusta el ${w}`))
    if (negated) excluded.push(key)
    else if (hasAny(text, f.says)) flavors.push(key)
  }
  // "café" asked as a drink is not a flavour request
  if (intents.has('drink') && !intents.has('recommend')) {
    const i = flavors.indexOf('cafe')
    if (i >= 0) flavors.splice(i, 1)
  }
  const occasion = Object.entries(OCCASIONS).find(([, words]) => hasAny(text, words))?.[0] ?? null
  const category = Object.entries(CATEGORY_WORDS).find(([, words]) => hasAny(text, words))?.[0] ?? null
  return {
    intents,
    unknown,
    flavors,
    excluded,
    occasion,
    category,
    people: parsePeople(text),
    budget: parseBudget(text),
    products: findProducts(text),
  }
}

/* ---------- recommendation ---------- */
const OCCASION_REASON = {
  cumpleanos: 'una torta entera para soplar las velas',
  regalo: 'viene en caja, perfecta para regalar',
  celebracion: 'rinde para compartir',
  antojo: 'formato individual, ideal para un antojo',
}

export function recommend({ occasion, flavors = [], excluded = [], people, budget, category }) {
  const scored = []
  for (const p of PRODUCTS) {
    if (category && p.category !== category) continue
    const text = productText(p)
    const reasons = []
    let score = p.featured ? 1 : 0

    const matchedWords = flavors.flatMap((f) => FLAVORS[f].matches.filter((m) => text.includes(m)))
    const hits = flavors.filter((f) => FLAVORS[f].matches.some((m) => text.includes(m)))
    if (flavors.length && hits.length === 0) continue
    score += hits.length * 4
    if (excluded.some((f) => FLAVORS[f].matches.some((m) => text.includes(m)))) continue

    // occasion fit, with the reason taken from the product's real format
    const giftBox = /caja|regalar|regalo/i.test(`${p.unit} ${p.tagline} ${p.description}`)
    if ((occasion === 'cumpleanos' || occasion === 'celebracion') && p.category !== 'individuales') {
      score += p.category === 'tortas' ? 4 : 2
      reasons.push(OCCASION_REASON[occasion])
    }
    if (occasion === 'regalo' && giftBox) {
      score += 5
      reasons.push(OCCASION_REASON.regalo)
    } else if (occasion === 'regalo' && p.category === 'individuales') {
      score += 1
      reasons.push('formato individual, un lindo detalle')
    }
    if (occasion === 'antojo' && p.category === 'individuales') {
      score += 5
      reasons.push(OCCASION_REASON.antojo)
    }

    // smallest size that serves everyone and fits the budget
    let size = null
    const fitting = p.sizes
      .filter((s) => !people || (servings(s.label) ?? 0) >= people)
      .filter((s) => !budget || s.price <= budget)
    if ((people || budget) && fitting.length === 0) continue
    if (people || budget) {
      size = fitting[0]
      score += 3
      reasons.push(`${size.label} por ${money(size.price)}`)
    }
    if (hits.length) reasons.unshift(`lleva ${[...new Set(matchedWords)].slice(0, 2).join(' y ')}`)

    scored.push({ p, score, price: size?.price ?? priceRange(p).min, note: reasons.join(' · ') || `${p.tagline} · ${fromPrice(p)}` })
  }
  // 2) ties go to the cheapest option that actually fits (the chosen size, not the smallest one)
  return scored.sort((a, b) => b.score - a.score || a.price - b.price).slice(0, 3)
}

/* ---------- handlers ---------- */
function greeting(seed) {
  return message(
    [
      pick(['¡Hola! Qué gusto tenerte por aquí.', '¡Hola, hola! Te damos la bienvenida a La Cakería.', '¡Hola! Pasa, que el horno ya está encendido.'], seed),
      'Soy el asistente de la pastelería: te ayudo a elegir postres, conocer precios y bebidas, o a hacer tu pedido. ¿Qué se te antoja hoy?',
    ],
    { suggestions: ['¿Qué me recomiendas para un cumpleaños?', 'Ver el menú completo', '¿Qué bebidas incluyen?', '¿Cómo hago un pedido?'] },
  )
}

function productAnswer(ids, d) {
  const products = ids.map(productById)
  const one = products.length === 1 ? products[0] : null

  if (one && (d.intents.has('price') || d.intents.has('cheap') || d.intents.has('expensive'))) {
    return message(
      [`La **${one.name}** cuesta ${fromPrice(one)}, según el tamaño:`, sizesLine(one), 'Además, incluye una bebida a elegir sin costo adicional.'],
      { products: [{ id: one.id, note: one.unit }], suggestions: ['¿Qué bebidas incluye?', '¿Para cuántas personas alcanza?', '¿Cómo la pido?'] },
    )
  }
  if (one && (d.intents.has('sizes') || d.people)) {
    const fits = d.people ? one.sizes.filter((s) => (servings(s.label) ?? 0) >= d.people) : []
    const text = [`La **${one.name}** viene en estos tamaños: ${sizesLine(one)}.`]
    if (d.people) {
      text.push(
        fits.length
          ? `Para ${d.people} personas te sirve la opción **${fits[0].label}** (${money(fits[0].price)}).`
          : `Ninguno de sus tamaños alcanza para ${d.people} personas. Podrías combinar dos o mirar una torta más grande.`,
      )
    }
    return message(text, { products: [{ id: one.id, note: fromPrice(one) }], suggestions: ['¿Qué bebida incluye?', 'Recomiéndame algo para más personas', '¿Cómo hago el pedido?'] })
  }
  if (one && d.intents.has('drink')) {
    return message(
      [`Sí: la **${one.name}** incluye una bebida a elegir, sin costo adicional.`, `Opciones: ${DRINK_LIST.join(', ')}.`, 'La eliges en la ficha del producto o directamente en el carrito.'],
      { products: [{ id: one.id, note: fromPrice(one) }], suggestions: ['¿Cuánto cuesta?', '¿Qué tamaños tiene?'] },
    )
  }
  if (one) {
    return message(
      [`**${one.name}** — ${one.tagline.toLowerCase()}.`, one.description, `Precio ${fromPrice(one)} (${one.sizes.length === 1 ? '1 tamaño' : `${one.sizes.length} tamaños`}) y trae una bebida incluida.`],
      { products: [{ id: one.id, note: sizesLine(one) }], suggestions: ['¿Qué tamaños tiene?', '¿Qué bebida incluye?', 'Recomiéndame otra opción'] },
    )
  }
  // several products: compare
  return message(
    ['Te dejo la comparación:', ...products.map((p) => `**${p.name}**: ${fromPrice(p)} · ${p.unit.toLowerCase()} · ${p.tags.join(', ')}`)],
    { products: products.map((p) => ({ id: p.id, note: fromPrice(p) })), suggestions: ['¿Cuál me recomiendas?', '¿Qué bebidas incluyen?'] },
  )
}

function recommendationAnswer(d, seed) {
  const picks = recommend(d)
  if (picks.length === 0 && d.people && !d.budget) {
    const pool = d.category ? PRODUCTS.filter((p) => p.category === d.category) : PRODUCTS
    const largest = Math.max(...pool.flatMap((p) => p.sizes.map((s) => servings(s.label) ?? 0)))
    const big = recommend({ ...d, people: largest })
    if (big.length) {
      return message(
        [
          `Ningún producto alcanza solo para ${d.people} personas: el tamaño más grande${d.category ? ` en ${d.category}` : ''} es para ${largest}.`,
          'Puedes combinar dos productos. Por ejemplo, estas opciones en su tamaño más grande:',
        ],
        { products: big.map(({ p, note }) => ({ id: p.id, note })), actions: [link('/menu', 'Ver el menú')], suggestions: ['¿Cuánto cuesta la primera?', '¿Cómo hago el pedido?'] },
      )
    }
  }
  if (picks.length === 0) {
    const limits = [d.people && `para ${d.people} personas`, d.budget && `con ${money(d.budget)}`].filter(Boolean).join(' y ')
    return message(
      [`Mmm, no encontré un producto del menú que cumpla todo eso${limits ? ` (${limits})` : ''}.`, 'Puedo mostrarte las opciones más cercanas, o puedes diseñar una torta a tu medida en el personalizador.'],
      { actions: [link('/menu', 'Ver el menú'), link('/personaliza', 'Personalizar una torta')], suggestions: ['Ver el menú completo', '¿Cuál es el más económico?'] },
    )
  }
  const intro = {
    cumpleanos: '¡Un cumpleaños! Estas son mis favoritas para celebrar:',
    regalo: 'Para regalar te sugiero:',
    celebracion: 'Para una celebración, estas opciones rinden muy bien:',
    antojo: 'Para darte un gusto, mira estas:',
  }[d.occasion] ?? pick(['Estas son mis recomendaciones:', 'Creo que te van a encantar:', 'Te recomiendo estas:'], seed)
  const extra = d.occasion === 'cumpleanos' || d.occasion === 'celebracion'
    ? 'Si prefieres una torta única, también puedes diseñarla capa por capa en el personalizador.'
    : 'Todas incluyen una bebida a elegir sin costo.'
  return message([intro, extra], {
    products: picks.map(({ p, note }) => ({ id: p.id, note })),
    actions: d.occasion === 'cumpleanos' || d.occasion === 'celebracion' ? [link('/personaliza', 'Diseñar mi torta')] : [],
    suggestions: ['¿Cuánto cuesta la primera?', 'Algo con chocolate', 'Algo frutal', '¿Cómo hago el pedido?'],
  })
}

function catalogAnswer(d) {
  const list = d.category ? PRODUCTS.filter((p) => p.category === d.category) : PRODUCTS
  const label = d.category ? CATEGORIES.find((c) => c.key === d.category)?.label.toLowerCase() : null
  return message(
    [
      d.category
        ? `En **${label}** tenemos ${list.length} opciones:`
        : `Nuestro menú tiene **${PRODUCTS.length} creaciones**: ${CATEGORIES.filter((c) => c.key !== 'all').map((c) => `${PRODUCTS.filter((p) => p.category === c.key).length} ${c.label.toLowerCase()}`).join(', ')}.`,
      ...list.map((p) => `• ${p.name} — ${fromPrice(p)}`),
      'Todas incluyen una bebida a elegir. ¿Quieres que te recomiende alguna?',
    ],
    {
      actions: [link(d.category ? `/menu?categoria=${d.category}` : '/menu', 'Ver en el menú')],
      suggestions: ['Recomiéndame algo', '¿Cuál es el más económico?', '¿Qué hay de temporada?'],
    },
  )
}

function priceOverview(d) {
  const byMin = [...PRODUCTS].sort((a, b) => priceRange(a).min - priceRange(b).min)
  if (d.intents.has('expensive') && !d.intents.has('cheap')) {
    const top = [...PRODUCTS].sort((a, b) => priceRange(b).max - priceRange(a).max).slice(0, 3)
    return message(['Las opciones más grandes (y de mayor precio) son:'], {
      products: top.map((p) => ({ id: p.id, note: `hasta ${money(priceRange(p).max)}` })),
      suggestions: ['¿Cuál es el más económico?', '¿Para cuántas personas alcanza?'],
    })
  }
  if (d.intents.has('cheap')) {
    return message(['Las opciones más económicas del menú son:', 'Todas incluyen una bebida sin costo adicional.'], {
      products: byMin.slice(0, 3).map((p) => ({ id: p.id, note: `${p.sizes[0].label}: ${money(priceRange(p).min)}` })),
      suggestions: ['Recomiéndame algo para regalar', 'Ver el menú completo'],
    })
  }
  const lo = byMin[0]
  const hi = [...PRODUCTS].sort((a, b) => priceRange(b).max - priceRange(a).max)[0]
  return message(
    [
      `Nuestros precios van desde **${money(priceRange(lo).min)}** (${lo.name}, ${lo.sizes[0].label.toLowerCase()}) hasta **${money(priceRange(hi).max)}** (${hi.name}, ${hi.sizes.at(-1).label}).`,
      'El precio depende del tamaño que elijas, y cada producto incluye una bebida sin costo. Son precios de referencia que se confirman con el pedido.',
      '¿De cuál producto quieres saber el precio?',
    ],
    { actions: [link('/menu', 'Ver precios en el menú')], suggestions: ['Precio de la Red Velvet', '¿Cuál es el más económico?', 'Tortas para 12 personas'] },
  )
}

const drinksAnswer = () =>
  message(
    [
      'Cada producto incluye **una bebida a elegir, sin costo adicional**:',
      ...DRINK_LIST.map((d) => `• ${d}`),
      'La eliges en la ficha del producto, en el carrito (puedes cambiarla ahí mismo) o en el último paso del personalizador.',
    ],
    { suggestions: ['¿Qué me recomiendas?', '¿Cómo hago un pedido?'] },
  )

const orderAnswer = (ids = []) =>
  message(
    [
      'Hacer un pedido es muy fácil:',
      '1. Elige un producto en el menú (o diseña tu torta en Personaliza).',
      '2. Pulsa **Agregar al carrito**. Ahí puedes cambiar el tamaño, la bebida incluida o quitar productos.',
      '3. Abre el carrito (el icono de arriba a la derecha) y pulsa **Confirmar pedido**.',
      'Los precios son de referencia y se confirman con tu pedido.',
    ],
    {
      products: ids.map((id) => ({ id, note: 'Puedes agregarlo desde aquí' })),
      actions: [link('/menu', 'Ir al menú'), { type: 'cart', label: 'Abrir carrito' }],
      suggestions: ['¿Qué me recomiendas?', '¿Qué bebidas incluyen?'],
    },
  )

const customAnswer = () =>
  message(
    [
      'En **Personaliza** diseñas tu torta capa por capa y la ves en 3D mientras eliges:',
      ...CUSTOM.groups.map((g) => `• ${g.title}: ${g.options.map((o) => o.label).join(', ')}`),
      '• Bebida incluida, como en el resto del menú.',
      `El precio de referencia parte en **${money(CUSTOM.base)}** para 8 porciones y cambia según lo que elijas. En el carrito puedes cambiar el tamaño: ${CUSTOM.sizes.map((s) => `${s.label} desde ${money(s.price)}`).join(' · ')}.`,
    ],
    { actions: [link('/personaliza', 'Diseñar mi torta')], suggestions: ['¿Cómo hago el pedido?', 'Mejor recomiéndame una del menú'] },
  )

const contactAnswer = (d) => {
  const text = []
  if (d.intents.has('hours')) {
    text.push('Nuestro horario de atención es:', ...SITE.hours.map((h) => `• ${h.days}: ${h.time}`))
  }
  if (d.intents.has('contact') || !d.intents.has('hours')) {
    text.push(
      'Puedes encontrarnos y escribirnos aquí:',
      `• Dirección: ${SITE.address}, ${SITE.city}`,
      `• Teléfono: ${SITE.phone}`,
      `• Correo: ${SITE.email}`,
      `• Redes: ${SITE.socials.map((s) => s.name).join(', ')} (enlaces al final de la página)`,
    )
  }
  return message(text, { actions: [link('/#contacto', 'Ver contacto')], suggestions: ['¿Cómo hago un pedido?', '¿Qué me recomiendas?'] })
}

function unknownAnswer(keys, ids = []) {
  const topics = keys.map((k) => UNKNOWN_TOPICS[k].topic)
  const list = topics.length > 1 ? `${topics.slice(0, -1).join(', ')} y ${topics.at(-1)}` : topics[0]
  const text = [
    `Esa es una muy buena pregunta, pero no tengo información sobre ${list}, y prefiero no inventarte nada.`,
    `Te recomiendo consultarlo directamente con la pastelería: ${SITE.phone} o ${SITE.email}.`,
  ]
  if (keys.includes('allergens')) text.push('Lo que sí puedo contarte es la descripción y los ingredientes destacados de cada producto.')
  return message(text, {
    products: ids.map((id) => ({ id, note: productById(id).description })),
    actions: [link('/#contacto', 'Ver contacto')],
    suggestions: ['¿Qué me recomiendas?', '¿Cómo hago un pedido?'],
  })
}

const recipesAnswer = () =>
  message(
    [
      'En **Inspiración dulce** encuentras recetas de postres de todo el mundo, traídas en tiempo real de TheMealDB y traducidas al español.',
      'Son ideas para inspirarte en casa: no forman parte de nuestro menú ni se pueden pedir.',
    ],
    { actions: [link('/inspiracion', 'Ver recetas')], suggestions: ['Mejor recomiéndame un postre del menú', '¿Cómo hago un pedido?'] },
  )

const aboutAnswer = () =>
  message(
    [
      'La Cakería es una pastelería de autor: un taller pequeño donde cada torta se piensa como una pieza única.',
      'Nuestra idea es sencilla: hornear pocas cosas, pero hacerlas extraordinarias.',
    ],
    { actions: [link('/nosotros', 'Conocer nuestra historia')], suggestions: ['Ver el menú completo', '¿Qué me recomiendas?'] },
  )

const helpAnswer = () =>
  message(
    [
      'Soy el asistente virtual de La Cakería (un asistente automático, no una persona). Puedo ayudarte a:',
      '• Conocer los productos del menú, sus precios y tamaños.',
      '• Recomendarte algo según la ocasión, el sabor, las personas o tu presupuesto.',
      '• Contarte qué bebidas vienen incluidas.',
      '• Explicarte cómo hacer tu pedido o diseñar tu propia torta.',
    ],
    { suggestions: ['¿Qué me recomiendas para regalar?', 'Tortas para 12 personas', 'Algo con chocolate por menos de $ 150.000'] },
  )

function fallback(seed) {
  return message(
    [
      pick(['Mmm, creo que no te entendí del todo.', 'Perdona, creo que no te entendí bien.', 'Esa no me la sé todavía.'], seed),
      'Puedo ayudarte con el menú, precios, bebidas incluidas, recomendaciones o cómo hacer tu pedido. ¿Lo intentamos con otras palabras?',
    ],
    { suggestions: ['Ver el menú completo', '¿Qué me recomiendas?', '¿Cómo hago un pedido?'] },
  )
}

/** "¿venden pizza?" → that item is not on the menu (never claim it exists). */
function notOnMenu(text) {
  const m = text.match(/ (?:venden|tienen|hacen|preparan|ofrecen|hay|quiero|busco) (?:algo de |un |una |unos |unas |el |la |los |las )?([a-z]{3,})/)
  if (!m) return null
  return message(
    [`No tenemos **${m[1]}** en el menú de La Cakería, y no quiero inventarte algo que no ofrecemos.`, `Esto sí lo preparamos: ${PRODUCTS.length} creaciones entre tortas, postres individuales y de temporada.`],
    { actions: [link('/menu', 'Ver el menú')], suggestions: ['Ver el menú completo', '¿Qué me recomiendas?'] },
  )
}

/* ---------- entry point ---------- */
export const welcomeMessage = () => greeting(0)

export function reply(input, context = { lastProducts: [], turn: 0 }) {
  const turn = (context.turn ?? 0) + 1
  const text = normalize(input)
  const d = detect(text)
  const next = { lastProducts: context.lastProducts ?? [], turn }

  // follow-ups ("¿y cuánto cuesta?") reuse the products from the previous answer
  const asksAboutDetails = d.intents.has('price') || d.intents.has('sizes') || d.intents.has('drink') || d.people
  if (d.products.length === 0 && next.lastProducts.length && asksAboutDetails && !d.intents.has('recommend') && !d.occasion && !d.category) {
    const referencesFirst = hasAny(text, ['el primero', 'la primera', 'primera', 'primero'])
    if (hasAny(text, FOLLOW_UP) || text.trim().split(' ').length <= 6) {
      d.products = referencesFirst || next.lastProducts.length === 1 ? [next.lastProducts[0]] : next.lastProducts
    }
  }

  let answer
  const only = (...keys) => [...d.intents].every((k) => keys.includes(k))

  if (text.trim() === '') answer = fallback(turn)
  else if (d.unknown.length) answer = unknownAnswer(d.unknown, d.products)
  else if (d.intents.has('custom')) answer = customAnswer()
  else if (d.products.length && !d.intents.has('recommend') && !d.intents.has('order')) answer = productAnswer(d.products, d)
  else if (d.intents.has('recommend') || d.occasion || d.flavors.length || d.excluded.length || ((d.people || d.budget) && !d.products.length)) {
    answer = recommendationAnswer(d, turn)
  } else if (d.intents.has('order')) answer = orderAnswer(d.products)
  else if (d.intents.has('cheap') || d.intents.has('expensive') || (d.intents.has('price') && only('price', 'catalog', 'greet'))) answer = priceOverview(d)
  else if (d.intents.has('catalog') || d.category) answer = catalogAnswer(d)
  else if (d.intents.has('drink')) answer = drinksAnswer()
  else if (d.intents.has('contact') || d.intents.has('hours')) answer = contactAnswer(d)
  else if (d.intents.has('recipes')) answer = recipesAnswer()
  else if (d.intents.has('about')) answer = aboutAnswer()
  else if (d.intents.has('help')) answer = helpAnswer()
  else if (d.intents.has('thanks')) {
    answer = message(pick(['¡Con mucho gusto! Si se te antoja algo más, aquí estoy.', '¡A ti! Que disfrutes cada bocado.', '¡Un placer ayudarte!'], turn), {
      suggestions: ['¿Cómo hago un pedido?', 'Ver el menú completo'],
    })
  } else if (d.intents.has('bye')) answer = message('¡Hasta pronto! Aquí estaré cuando se te antoje algo dulce.')
  else if (d.intents.has('greet')) answer = greeting(turn)
  else answer = notOnMenu(text) ?? fallback(turn)

  if (answer.products.length) next.lastProducts = answer.products.map((p) => p.id)
  return { message: answer, context: next }
}

/**
 * Catalog content — edit names, descriptions, prices and photos freely.
 * Photos: Unsplash (free Unsplash License), loaded from images.unsplash.com.
 * Replace `image` with a local file (e.g. '/products/red-velvet.jpg' in /public)
 * when the bakery has its own photography.
 */
const unsplash = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`

export const CURRENCY = '$'

export const CATEGORIES = [
  { key: 'all', label: 'Todo' },
  { key: 'tortas', label: 'Tortas' },
  { key: 'individuales', label: 'Individuales' },
  { key: 'temporada', label: 'Temporada' },
]

const CATALOG = [
  {
    id: 'dark-chocolate-raspberry',
    name: 'Dark Chocolate Raspberry',
    tagline: 'La firma de la casa',
    description:
      'Bizcocho de cacao al 70 %, compota de frambuesa fresca y ganache brillante que cae por los bordes.',
    sizes: [
      { label: '6 porciones', price: 34 },
      { label: '8 porciones', price: 42 },
      { label: '12 porciones', price: 58 },
      { label: '20 porciones', price: 88 },
    ],
    defaultSize: 1,
    unit: 'Torta entera',
    category: 'tortas',
    featured: true,
    image: unsplash('1761315631665-cf6220061f20', 1200),
    tags: ['Cacao 70 %', 'Frambuesa'],
  },
  {
    id: 'red-velvet',
    name: 'Red Velvet',
    tagline: 'Terciopelo clásico',
    description: 'Capas aterciopeladas de cacao suave con frosting de queso crema batido a mano.',
    sizes: [
      { label: '6 porciones', price: 30 },
      { label: '8 porciones', price: 38 },
      { label: '12 porciones', price: 52 },
      { label: '20 porciones', price: 80 },
    ],
    defaultSize: 1,
    unit: 'Torta entera',
    category: 'tortas',
    featured: true,
    image: unsplash('1688153009623-0d9a3ba1b105'),
    tags: ['Queso crema'],
  },
  {
    id: 'cheesecake-frutos-rojos',
    name: 'Cheesecake de frutos rojos',
    tagline: 'Cremoso y horneado lento',
    description: 'Base de galleta tostada, relleno horneado a baja temperatura y coulis de frutos rojos.',
    sizes: [
      { label: '6 porciones', price: 26 },
      { label: '10 porciones', price: 36 },
      { label: '16 porciones', price: 54 },
    ],
    defaultSize: 1,
    unit: 'Torta entera',
    category: 'tortas',
    featured: true,
    image: unsplash('1611497438246-dcbb383de3c4'),
    tags: ['Horneado lento'],
  },
  {
    id: 'cupcakes-artesanales',
    name: 'Cupcakes artesanales',
    tagline: 'Caja de seis',
    description: 'Red velvet, cacao y vainilla con crema suave y migas crujientes. Ideales para regalar.',
    sizes: [
      { label: 'Caja x6', price: 18 },
      { label: 'Caja x12', price: 34 },
      { label: 'Caja x24', price: 64 },
    ],
    defaultSize: 0,
    unit: 'Caja para regalar',
    category: 'individuales',
    image: unsplash('1614707267537-b85aaf00c4b7'),
    tags: ['Para regalar'],
  },
  {
    id: 'tarta-temporada',
    name: 'Tarta de temporada',
    tagline: 'Edición limitada',
    description: 'Masa sablée, crema pastelera de vainilla y la fruta más fresca de la semana.',
    sizes: [
      { label: '8 porciones', price: 32 },
      { label: '12 porciones', price: 44 },
    ],
    defaultSize: 0,
    unit: 'Tarta entera',
    category: 'temporada',
    image: unsplash('1620980776848-84ac10194945'),
    tags: ['Fruta fresca'],
  },
]

/**
 * `sizes` = sample price per size (edit freely); `defaultSize` = index preselected.
 * `price` is derived: the lowest size price, shown as "desde $X".
 */
export const PRODUCTS = CATALOG.map((p) => ({
  ...p,
  price: Math.min(...p.sizes.map((s) => s.price)),
}))

/** Products shown on the home page ("featured: true" above). */
export const FEATURED_PRODUCTS = PRODUCTS.filter((p) => p.featured)

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id)

export const categoryLabel = (key) => CATEGORIES.find((c) => c.key === key)?.label ?? key

/** Portion sizes offered in the general order form (no product chosen). */
export const ORDER_SIZES = ['6 porciones', '8 porciones', '12 porciones', '20 porciones']

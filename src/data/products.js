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
  {
    id: 'torta-trufa-chocolate',
    name: 'Torta trufa de chocolate',
    tagline: 'Para los más golosos',
    description: 'Capas de bizcocho de cacao con crema trufada de chocolate semiamargo y virutas por encima.',
    sizes: [
      { label: '6 porciones', price: 32 },
      { label: '8 porciones', price: 40 },
      { label: '12 porciones', price: 56 },
      { label: '20 porciones', price: 84 },
    ],
    defaultSize: 1,
    unit: 'Torta entera',
    category: 'tortas',
    image: unsplash('1605807646837-485a3bc9bf1b'),
    tags: ['Chocolate', 'Trufa'],
  },
  {
    id: 'mini-red-velvet',
    name: 'Mini red velvet',
    tagline: 'Torta individual',
    description: 'Nuestra red velvet en formato pequeño: dos capas aterciopeladas y frosting de queso crema.',
    sizes: [
      { label: 'Unidad', price: 7 },
      { label: 'Caja x4', price: 26 },
    ],
    defaultSize: 0,
    unit: 'Individual',
    category: 'individuales',
    image: unsplash('1659489397202-cd5d8875806b'),
    tags: ['Queso crema'],
  },
  {
    id: 'tiramisu-de-la-casa',
    name: 'Tiramisú de la casa',
    tagline: 'Clásico italiano',
    description: 'Bizcochos de soletilla bañados en café, crema de mascarpone y cacao amargo espolvoreado.',
    sizes: [
      { label: 'Porción', price: 8 },
      { label: 'Molde 6 porciones', price: 30 },
    ],
    defaultSize: 0,
    unit: 'Postre frío',
    category: 'individuales',
    image: unsplash('1681564334698-8c85a9b4b1f8'),
    tags: ['Mascarpone', 'Café'],
  },
  {
    id: 'tartaletas-frutos-rojos',
    name: 'Tartaletas de frutos rojos',
    tagline: 'Bocados de temporada',
    description: 'Masa quebrada crujiente, crema pastelera de vainilla y frutos rojos frescos glaseados.',
    sizes: [
      { label: 'Caja x4', price: 16 },
      { label: 'Caja x8', price: 30 },
    ],
    defaultSize: 0,
    unit: 'Caja para compartir',
    category: 'individuales',
    image: unsplash('1646321155195-44f0a4f91d1b'),
    tags: ['Fruta fresca'],
  },
  {
    id: 'tarta-limon-frutos-rojos',
    name: 'Tarta de limón y frutos rojos',
    tagline: 'Fresca y ácida',
    description: 'Crema de limón sedosa sobre masa sablée, decorada con rodajas de limón y frutos rojos.',
    sizes: [
      { label: '8 porciones', price: 34 },
      { label: '12 porciones', price: 46 },
    ],
    defaultSize: 0,
    unit: 'Tarta entera',
    category: 'temporada',
    image: unsplash('1614174486496-344ef3e9d870'),
    tags: ['Limón', 'Frutos rojos'],
  },
  {
    id: 'torta-zanahoria',
    name: 'Torta de zanahoria',
    tagline: 'Especiada y húmeda',
    description: 'Bizcocho de zanahoria con canela y nueces, relleno y cubierto de frosting de queso crema.',
    sizes: [
      { label: '6 porciones', price: 28 },
      { label: '8 porciones', price: 36 },
      { label: '12 porciones', price: 50 },
      { label: '20 porciones', price: 76 },
    ],
    defaultSize: 1,
    unit: 'Torta entera',
    category: 'tortas',
    image: unsplash('1676300186098-9b5ae9916e3c'),
    tags: ['Nueces', 'Queso crema'],
  },
  {
    id: 'macarons-frambuesa',
    name: 'Macarons de frambuesa',
    tagline: 'Bocados franceses',
    description: 'Conchas de almendra crujientes por fuera y suaves por dentro, rellenas de ganache de frambuesa.',
    sizes: [
      { label: 'Caja x6', price: 14 },
      { label: 'Caja x12', price: 26 },
    ],
    defaultSize: 0,
    unit: 'Caja para regalar',
    category: 'individuales',
    image: unsplash('1698599620639-d4409e51ad82'),
    tags: ['Almendra', 'Frambuesa'],
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

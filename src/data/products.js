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

export const PRODUCTS = [
  {
    id: 'dark-chocolate-raspberry',
    name: 'Dark Chocolate Raspberry',
    tagline: 'La firma de la casa',
    description:
      'Bizcocho de cacao al 70 %, compota de frambuesa fresca y ganache brillante que cae por los bordes.',
    price: 42,
    unit: 'torta 8 porciones',
    category: 'tortas',
    image: unsplash('1761315631665-cf6220061f20', 1200),
    tags: ['Cacao 70 %', 'Frambuesa'],
  },
  {
    id: 'red-velvet',
    name: 'Red Velvet',
    tagline: 'Terciopelo clásico',
    description: 'Capas aterciopeladas de cacao suave con frosting de queso crema batido a mano.',
    price: 38,
    unit: 'torta 8 porciones',
    category: 'tortas',
    image: unsplash('1688153009623-0d9a3ba1b105'),
    tags: ['Queso crema'],
  },
  {
    id: 'cheesecake-frutos-rojos',
    name: 'Cheesecake de frutos rojos',
    tagline: 'Cremoso y horneado lento',
    description: 'Base de galleta tostada, relleno horneado a baja temperatura y coulis de frutos rojos.',
    price: 36,
    unit: 'torta 10 porciones',
    category: 'tortas',
    image: unsplash('1611497438246-dcbb383de3c4'),
    tags: ['Horneado lento'],
  },
  {
    id: 'cupcakes-artesanales',
    name: 'Cupcakes artesanales',
    tagline: 'Caja de seis',
    description: 'Red velvet, cacao y vainilla con crema suave y migas crujientes. Ideales para regalar.',
    price: 18,
    unit: 'caja x6',
    category: 'individuales',
    image: unsplash('1614707267537-b85aaf00c4b7'),
    tags: ['Para regalar'],
  },
  {
    id: 'tarta-temporada',
    name: 'Tarta de temporada',
    tagline: 'Edición limitada',
    description: 'Masa sablée, crema pastelera de vainilla y la fruta más fresca de la semana.',
    price: 32,
    unit: 'tarta 8 porciones',
    category: 'temporada',
    image: unsplash('1620980776848-84ac10194945'),
    tags: ['Fruta fresca'],
  },
]

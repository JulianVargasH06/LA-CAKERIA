/**
 * Options for the 3D cake (hero + customizer).
 * Colours here are ingredient colours used by the 3D materials only;
 * the page palette lives in src/styles/tokens.css.
 * Prices are sample values in USD — edit freely.
 */
export const SPONGES = {
  chocolate: {
    label: 'Cacao intenso',
    base: '#3b1a10',
    pore: '#160704',
    crumb: '#5e2d1a',
    price: 0,
  },
  redVelvet: {
    label: 'Red velvet',
    base: '#8c1422',
    pore: '#3f040b',
    crumb: '#b42a35',
    price: 4,
  },
  vanilla: {
    label: 'Vainilla',
    base: '#dcb57a',
    pore: '#9c7140',
    crumb: '#f1d7a4',
    price: 0,
  },
}

export const FILLINGS = {
  raspberry: { label: 'Compota de frambuesa', color: '#8f0a1d', roughness: 0.22, price: 0 },
  cream: { label: 'Crema de queso', color: '#f6edd6', roughness: 0.55, price: 3 },
  caramel: { label: 'Dulce de leche', color: '#a8611f', roughness: 0.25, price: 3 },
}

export const GLAZES = {
  ganache: { label: 'Ganache 70%', color: '#2a0e06', roughness: 0.16, price: 0 },
  white: { label: 'Chocolate blanco', color: '#f2e4c2', roughness: 0.24, price: 4 },
  raspberry: { label: 'Espejo de frambuesa', color: '#b3172e', roughness: 0.1, price: 5 },
  caramel: { label: 'Caramelo salado', color: '#9a4f17', roughness: 0.14, price: 4 },
}

export const DECORATIONS = {
  both: { label: 'Frambuesas y rulos', raspberries: true, curls: true, price: 6 },
  raspberries: { label: 'Solo frambuesas', raspberries: true, curls: false, price: 4 },
  curls: { label: 'Rulos de chocolate', raspberries: false, curls: true, price: 3 },
  none: { label: 'Minimal', raspberries: false, curls: false, price: 0 },
}

export const BASE_PRICE = 38

export const SIGNATURE_CAKE = {
  sponge: 'chocolate',
  filling: 'raspberry',
  glaze: 'ganache',
  decoration: 'both',
}

export function resolveCake(selection) {
  return {
    sponge: SPONGES[selection.sponge],
    filling: FILLINGS[selection.filling],
    glaze: GLAZES[selection.glaze],
    decoration: DECORATIONS[selection.decoration],
  }
}

export function priceFor(selection) {
  const c = resolveCake(selection)
  return BASE_PRICE + c.sponge.price + c.filling.price + c.glaze.price + c.decoration.price
}

export function describeCake(selection) {
  const c = resolveCake(selection)
  return `${c.sponge.label} · ${c.filling.label} · ${c.glaze.label} · ${c.decoration.label}`
}

import { createContext, useContext } from 'react'
import { CUSTOM_DEFAULT_SIZE, customSizes, describeCake } from '../data/cakeOptions'

/**
 * Shopping cart (minimal version): add, change size, remove, check out.
 * State lives in App.jsx (useReducer); it is kept in memory only.
 *
 *   const cart = useCart()
 *   cart.addProduct(product)          // catalog product, default size
 *   cart.addCustomCake(selection)     // cake from /personaliza
 */
export const CartContext = createContext(null)

export const useCart = () => useContext(CartContext)

let nextId = 1

/** A line in the cart. `sizes` carries the price of every size. */
function lineItem({ productId = null, name, image = null, details = null, sizes, sizeIndex }) {
  return { uid: nextId++, productId, name, image, details, sizes, sizeIndex }
}

export const productItem = (product, sizeIndex = product.defaultSize) =>
  lineItem({ productId: product.id, name: product.name, image: product.image, sizes: product.sizes, sizeIndex })

export const customCakeItem = (selection) =>
  lineItem({
    name: 'Torta personalizada',
    details: describeCake(selection),
    sizes: customSizes(selection),
    sizeIndex: CUSTOM_DEFAULT_SIZE,
  })

export const itemPrice = (item) => item.sizes[item.sizeIndex].price
export const itemSize = (item) => item.sizes[item.sizeIndex].label
export const cartTotal = (items) => items.reduce((sum, item) => sum + itemPrice(item), 0)

export function cartReducer(state, action) {
  switch (action.type) {
    case 'add':
      return { items: [...state.items, action.item], open: true }
    case 'size':
      return {
        ...state,
        items: state.items.map((i) => (i.uid === action.uid ? { ...i, sizeIndex: action.sizeIndex } : i)),
      }
    case 'remove':
      return { ...state, items: state.items.filter((i) => i.uid !== action.uid) }
    case 'clear':
      return { ...state, items: [] }
    case 'open':
      return { ...state, open: true }
    case 'close':
      return { ...state, open: false }
    default:
      return state
  }
}

import { lazy, Suspense, useCallback, useMemo, useReducer, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { Route, Routes } from 'react-router'
import CartPanel from './components/CartPanel'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import OrderModal from './components/OrderModal'
import PageLoader from './components/PageLoader'
import ScrollManager from './components/ScrollManager'
import { CartContext, cartReducer, customCakeItem, productItem } from './context/cart'
import { OrderContext } from './context/order'
import HomePage from './pages/HomePage'

// Secondary pages are code-split: the home page (and its 3D hero) loads first.
const MenuPage = lazy(() => import('./pages/MenuPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const PersonalizePage = lazy(() => import('./pages/PersonalizePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

/** Site layout shared by every route: navbar, page content, footer, cart and order modal. */
export default function App() {
  // `cart: true` = checking out the cart; otherwise a general request (optionally one product)
  const [order, setOrder] = useState({ open: false, product: null, details: null, cart: false })
  const [cartState, dispatch] = useReducer(cartReducer, { items: [], open: false })

  const openOrder = useCallback(
    (product = null, details = null) => setOrder({ open: true, product, details, cart: false }),
    [],
  )
  const closeOrder = useCallback(() => setOrder((o) => ({ ...o, open: false })), [])

  const close = useCallback(() => dispatch({ type: 'close' }), [])
  const cart = useMemo(
    () => ({
      ...cartState,
      addProduct: (product, sizeIndex) => dispatch({ type: 'add', item: productItem(product, sizeIndex) }),
      addCustomCake: (selection) => dispatch({ type: 'add', item: customCakeItem(selection) }),
      setSize: (uid, sizeIndex) => dispatch({ type: 'size', uid, sizeIndex }),
      remove: (uid) => dispatch({ type: 'remove', uid }),
      clear: () => dispatch({ type: 'clear' }),
      open: cartState.open,
      show: () => dispatch({ type: 'open' }),
      close,
    }),
    [cartState, close],
  )

  const checkout = useCallback(() => {
    close()
    setOrder({ open: true, product: null, details: null, cart: true })
  }, [close])

  return (
    <MotionConfig reducedMotion="user">
      <OrderContext value={openOrder}>
        <CartContext value={cart}>
          <ScrollManager />
          <a className="skip-link" href="#contenido">
            Saltar al contenido
          </a>
          <Navbar onOrder={openOrder} />
          <main id="contenido">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route index element={<HomePage />} />
                <Route path="menu" element={<MenuPage />} />
                <Route path="menu/:productId" element={<ProductPage />} />
                <Route path="personaliza" element={<PersonalizePage />} />
                <Route path="nosotros" element={<AboutPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer onOrder={openOrder} />
          <CartPanel onCheckout={checkout} />
          <OrderModal {...order} onClose={closeOrder} />
        </CartContext>
      </OrderContext>
    </MotionConfig>
  )
}

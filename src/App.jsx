import { lazy, Suspense, useCallback, useMemo, useReducer, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { Route, Routes } from 'react-router'
import CartPanel from './components/CartPanel'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import OrderReceivedModal from './components/OrderReceivedModal'
import PageLoader from './components/PageLoader'
import ScrollManager from './components/ScrollManager'
import { CartContext, cartReducer, customCakeItem, productItem } from './context/cart'
import HomePage from './pages/HomePage'

// Secondary pages are code-split: the home page (and its 3D hero) loads first.
const MenuPage = lazy(() => import('./pages/MenuPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const PersonalizePage = lazy(() => import('./pages/PersonalizePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

/** Site layout shared by every route: navbar, page content, footer, cart and confirmation. */
export default function App() {
  const [cartState, dispatch] = useReducer(cartReducer, { items: [], open: false })
  const [received, setReceived] = useState(false)

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

  // "Confirmar pedido": no form, just empty the cart and show "¡Pedido recibido!"
  const confirmOrder = useCallback(() => {
    dispatch({ type: 'clear' })
    close()
    setReceived(true)
  }, [close])

  return (
    <MotionConfig reducedMotion="user">
      <CartContext value={cart}>
        <ScrollManager />
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <Navbar />
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
        <Footer />
        <CartPanel onConfirm={confirmOrder} />
        <OrderReceivedModal open={received} onClose={() => setReceived(false)} />
      </CartContext>
    </MotionConfig>
  )
}

import { lazy, Suspense, useCallback, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { Route, Routes } from 'react-router'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import OrderModal from './components/OrderModal'
import PageLoader from './components/PageLoader'
import ScrollManager from './components/ScrollManager'
import { OrderContext } from './context/order'
import HomePage from './pages/HomePage'

// Secondary pages are code-split: the home page (and its 3D hero) loads first.
const MenuPage = lazy(() => import('./pages/MenuPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const PersonalizePage = lazy(() => import('./pages/PersonalizePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

/** Site layout shared by every route: navbar, page content, footer and the order modal. */
export default function App() {
  const [order, setOrder] = useState({ open: false, product: null, details: null })

  const openOrder = useCallback(
    (product = null, details = null) => setOrder({ open: true, product, details }),
    [],
  )
  const closeOrder = useCallback(() => setOrder((o) => ({ ...o, open: false })), [])

  return (
    <MotionConfig reducedMotion="user">
      <OrderContext value={openOrder}>
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
        <OrderModal {...order} onClose={closeOrder} />
      </OrderContext>
    </MotionConfig>
  )
}

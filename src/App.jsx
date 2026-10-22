import { useCallback, useState } from 'react'
import { MotionConfig } from 'motion/react'
import CakeCustomizer from './components/CakeCustomizer'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Navbar from './components/Navbar'
import OrderModal from './components/OrderModal'
import OurStory from './components/OurStory'
import ProductCatalog from './components/ProductCatalog'

export default function App() {
  const [order, setOrder] = useState({ open: false, product: null, details: null })

  const openOrder = useCallback(
    (product = null, details = null) => setOrder({ open: true, product, details }),
    [],
  )
  const closeOrder = useCallback(() => setOrder((o) => ({ ...o, open: false })), [])

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#menu">
        Saltar al menú
      </a>
      <Navbar onOrder={openOrder} />
      <main>
        <Hero onOrder={openOrder} />
        <Marquee />
        <ProductCatalog onOrder={openOrder} />
        <CakeCustomizer onOrder={openOrder} />
        <OurStory />
      </main>
      <Footer onOrder={openOrder} />
      <OrderModal {...order} onClose={closeOrder} />
    </MotionConfig>
  )
}

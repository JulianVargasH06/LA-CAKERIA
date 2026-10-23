import CustomizerPromo from '../components/CustomizerPromo'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import OurStory from '../components/OurStory'
import ProductCatalog from '../components/ProductCatalog'
import { useOrder } from '../context/order'

/** "/" — the original landing page, now the front door of the site. */
export default function HomePage() {
  const openOrder = useOrder()
  return (
    <>
      <title>La Cakería — Pastelería de autor</title>
      <Hero onOrder={openOrder} />
      <Marquee />
      <ProductCatalog onOrder={openOrder} />
      <CustomizerPromo />
      <OurStory />
    </>
  )
}

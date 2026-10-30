import CustomizerPromo from '../components/CustomizerPromo'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import OurStory from '../components/OurStory'
import ProductCatalog from '../components/ProductCatalog'

/** "/" — the original landing page, now the front door of the site. */
export default function HomePage() {
  return (
    <>
      <title>La Cakería — Pastelería de autor</title>
      <Hero />
      <Marquee />
      <ProductCatalog />
      <CustomizerPromo />
      <OurStory />
    </>
  )
}

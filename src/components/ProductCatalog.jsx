import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Menu } from 'semantic-ui-react'
import { CATEGORIES, PRODUCTS } from '../data/products'
import ProductCard from './ProductCard'
import Reveal from './Reveal'

const VARIANTS = ['feature', 'tall', 'square', 'square', 'wide']

export default function ProductCatalog({ onOrder }) {
  const [category, setCategory] = useState('all')
  const visible = PRODUCTS.filter((p) => category === 'all' || p.category === category)

  return (
    <section className="catalog section" id="menu" aria-labelledby="catalog-title">
      <div className="section__inner">
        <header className="catalog__head">
          <Reveal as="p" className="eyebrow">El menú — 2026</Reveal>
          <Reveal as="h2" className="display catalog__title" id="catalog-title" delay={0.05}>
            Hecho para <em>antojarse</em>
          </Reveal>
          <Reveal className="catalog__intro" delay={0.1}>
            <p>
              Cinco creaciones, horneadas en pequeños lotes. Precios de referencia — consulta
              tamaños y disponibilidad al hacer tu pedido.
            </p>
            <Menu secondary className="ck-filter" aria-label="Filtrar productos">
              {CATEGORIES.map((c) => (
                <Menu.Item
                  key={c.key}
                  name={c.label}
                  active={category === c.key}
                  onClick={() => setCategory(c.key)}
                />
              ))}
            </Menu>
          </Reveal>
        </header>

        <div className={`catalog__grid ${category !== 'all' ? 'is-filtered' : ''}`}>
          <AnimatePresence mode="popLayout">
            {visible.map((product) => {
              const index = PRODUCTS.indexOf(product)
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  variant={category === 'all' ? VARIANTS[index] : 'square'}
                  onOrder={onOrder}
                />
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

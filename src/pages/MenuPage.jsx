import { useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useSearchParams } from 'react-router'
import { Button, Dropdown, Icon, Input, Menu } from 'semantic-ui-react'
import { FlowerIcon } from '../components/Icons'
import PageHeader from '../components/PagePanel'
import ProductCard from '../components/ProductCard'
import { CATEGORIES, FEATURED_PRODUCTS, PRODUCTS } from '../data/products'

const SORTS = [
  { key: 'destacados', value: 'destacados', text: 'Destacados primero' },
  { key: 'precio-asc', value: 'precio-asc', text: 'Precio: menor a mayor' },
  { key: 'precio-desc', value: 'precio-desc', text: 'Precio: mayor a menor' },
  { key: 'nombre', value: 'nombre', text: 'Nombre (A–Z)' },
]

// photo masks rotate so the grid keeps the editorial rhythm of the home page
const VARIANTS = ['tall', 'square', 'blob']

const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const sorters = {
  destacados: (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
  'precio-asc': (a, b) => a.price - b.price,
  'precio-desc': (a, b) => b.price - a.price,
  nombre: (a, b) => a.name.localeCompare(b.name, 'es'),
}

/** "/menu" — full catalog with category filter, search and sorting. */
export default function MenuPage() {
  // filters live in the URL (?categoria=&q=&orden=) so they survive back/forward and can be shared
  const [params, setParams] = useSearchParams()
  const category = params.get('categoria') ?? 'all'
  const query = params.get('q') ?? ''
  const sort = sorters[params.get('orden')] ? params.get('orden') : 'destacados'

  const update = (key, value, fallback) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (!value || value === fallback) next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: key === 'q', preventScrollReset: true },
    )
  }

  const results = useMemo(() => {
    const q = normalize(query.trim())
    return PRODUCTS.filter((p) => category === 'all' || p.category === category)
      .filter((p) => !q || normalize(`${p.name} ${p.tagline}`).includes(q))
      .sort(sorters[sort])
  }, [category, query, sort])

  const counts = useMemo(
    () =>
      Object.fromEntries(
        CATEGORIES.map((c) => [c.key, PRODUCTS.filter((p) => c.key === 'all' || p.category === c.key).length]),
      ),
    [],
  )

  const reset = () => setParams({}, { preventScrollReset: true })
  const filtered = category !== 'all' || query

  return (
    <>
      <title>Menú — La Cakería</title>
      <PageHeader
        id="menu-title"
        eyebrow="El menú completo"
        title={
          <>
            Todo lo que <em>sale</em> del horno
          </>
        }
        intro="Tortas para compartir, piezas individuales y ediciones de temporada. Horneamos en pequeños lotes: los precios son de referencia y se confirman al hacer tu pedido."
        badge="El menú · Hecho a mano · "
        aside={
          <div className="menu-head__photo">
            <img src={FEATURED_PRODUCTS[0].image} alt={FEATURED_PRODUCTS[0].name} />
          </div>
        }
      />

      <section className="sheet menu" aria-label="Catálogo">
        <div className="section__inner">
          <div className="menu__toolbar">
            <Menu secondary className="ck-filter" aria-label="Filtrar por categoría">
              {CATEGORIES.map((c) => (
                <Menu.Item
                  key={c.key}
                  as="button"
                  type="button"
                  active={category === c.key}
                  aria-pressed={category === c.key}
                  onClick={() => update('categoria', c.key, 'all')}
                >
                  {c.label}
                  <span className="ck-filter__count">{counts[c.key]}</span>
                </Menu.Item>
              ))}
            </Menu>

            <div className="menu__controls">
              <Input
                className="ck-search"
                icon={<Icon name="search" />}
                iconPosition="left"
                placeholder="Buscar por nombre…"
                value={query}
                onChange={(_, { value }) => update('q', value, '')}
                aria-label="Buscar productos por nombre"
                type="search"
              />
              <Dropdown
                className="ck-sort"
                selection
                options={SORTS}
                value={sort}
                onChange={(_, { value }) => update('orden', value, 'destacados')}
                aria-label="Ordenar productos"
              />
            </div>
          </div>

          <p className="menu__status" role="status">
            {results.length === 1 ? '1 creación' : `${results.length} creaciones`}
            {filtered && (
              <button type="button" className="menu__clear" onClick={reset}>
                Limpiar filtros
              </button>
            )}
          </p>

          {results.length > 0 ? (
            <div className="menu__grid">
              <AnimatePresence mode="popLayout">
                {results.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={PRODUCTS.indexOf(product)}
                    variant={VARIANTS[i % VARIANTS.length]}
                    headingLevel={2}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div className="menu__empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <FlowerIcon size={36} />
              <h2>Nada por aquí… todavía.</h2>
              <p>No encontramos creaciones con esos filtros. Prueba otra búsqueda o diseña la tuya.</p>
              <Button className="ck-btn ck-btn--dark" onClick={reset}>
                Ver todo el menú
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </>
  )
}

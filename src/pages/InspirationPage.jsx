import { useMemo, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { useSearchParams } from 'react-router'
import { Button, Icon, Input } from 'semantic-ui-react'
import { ApiEmpty, ApiError, ApiLoading } from '../components/ApiState'
import PageHeader from '../components/PagePanel'
import RecipeCard from '../components/RecipeCard'
import { useAsync } from '../hooks/useAsync'
import { fetchDessertRecipes, MEALDB_SITE } from '../services/mealdb'

const PAGE_SIZE = 12
const VARIANTS = ['blob', 'tall', 'square', 'tall']

const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

/**
 * "/inspiracion" — dessert recipes loaded live from TheMealDB (external API).
 * They are ideas for inspiration, not products of the bakery.
 */
export default function InspirationPage() {
  const recipes = useAsync(fetchDessertRecipes, 'desserts')
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [limit, setLimit] = useState(PAGE_SIZE)

  const results = useMemo(() => {
    const q = normalize(query.trim())
    const list = recipes.data ?? []
    return q ? list.filter((r) => normalize(r.name).includes(q)) : list
  }, [recipes.data, query])

  const search = (value) => {
    setLimit(PAGE_SIZE)
    setParams(value ? { q: value } : {}, { replace: true, preventScrollReset: true })
  }

  return (
    <>
      <title>Inspiración dulce — La Cakería</title>
      <PageHeader
        id="inspiration-title"
        eyebrow="Fuente externa · TheMealDB"
        title={
          <>
            Inspiración <em>dulce</em>
          </>
        }
        intro="Postres de todo el mundo, consultados en tiempo real en TheMealDB, una base de datos pública de recetas. No forman parte de nuestro menú: son ideas para inspirarte en tu cocina."
        badge="Recetas del mundo · TheMealDB · "
      />

      <section className="sheet inspiration" aria-label="Recetas de postres">
        <div className="section__inner">
          <div className="inspiration__toolbar">
            <p className="inspiration__source">
              Recetas, fotos e instrucciones de{' '}
              <a href={MEALDB_SITE} target="_blank" rel="noreferrer">
                TheMealDB
              </a>{' '}
              · categoría <b>Dessert</b> · textos originales en inglés
            </p>
            <Input
              className="ck-search"
              icon={<Icon name="search" />}
              iconPosition="left"
              placeholder="Buscar receta…"
              value={query}
              onChange={(_, { value }) => search(value)}
              aria-label="Buscar recetas por nombre"
              type="search"
              disabled={recipes.status !== 'success'}
            />
          </div>

          {recipes.status === 'loading' && <ApiLoading label="Cargando recetas desde TheMealDB…" />}

          {recipes.status === 'error' && (
            <ApiError title="No pudimos conectar con TheMealDB" error={recipes.error} onRetry={recipes.retry} />
          )}

          {recipes.status === 'success' &&
            (results.length === 0 ? (
              <ApiEmpty
                title={query ? 'Sin coincidencias' : 'No hay recetas disponibles'}
                text={
                  query
                    ? `Ninguna receta de postre contiene “${query}”. Prueba con otra palabra (en inglés, como “cake” o “chocolate”).`
                    : 'TheMealDB no devolvió recetas en este momento.'
                }
              >
                {query && (
                  <Button className="ck-btn ck-btn--dark" onClick={() => search('')}>
                    Ver todas las recetas
                  </Button>
                )}
              </ApiEmpty>
            ) : (
              <>
                <p className="menu__status" role="status">
                  {results.length} {results.length === 1 ? 'receta' : 'recetas'}
                  {query ? ` para “${query}”` : ' de postres'}
                </p>
                <div className="recipes__grid">
                  <AnimatePresence mode="popLayout">
                    {results.slice(0, limit).map((recipe, i) => (
                      <RecipeCard key={recipe.id} recipe={recipe} variant={VARIANTS[i % VARIANTS.length]} />
                    ))}
                  </AnimatePresence>
                </div>
                {results.length > limit && (
                  <div className="recipes__more">
                    <Button className="ck-btn ck-btn--outline ck-btn--lg" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
                      Ver más recetas ({results.length - limit})
                    </Button>
                  </div>
                )}
              </>
            ))}
        </div>
      </section>
    </>
  )
}

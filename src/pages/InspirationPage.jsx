import { useMemo, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { useSearchParams } from 'react-router'
import { Button, Icon, Input } from 'semantic-ui-react'
import { ApiEmpty, ApiError, ApiLoading } from '../components/ApiState'
import PageHeader from '../components/PagePanel'
import RecipeCard from '../components/RecipeCard'
import TranslationNotice from '../components/TranslationNotice'
import { useAsync } from '../hooks/useAsync'
import { fetchDessertRecipes, MEALDB_SITE } from '../services/mealdb'
import { hasSpanish, toSpanish, translateToSpanish } from '../services/translate'

const PAGE_SIZE = 12
const VARIANTS = ['blob', 'tall', 'square', 'tall']

const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

/**
 * "/inspiracion" — dessert recipes loaded live from TheMealDB (external API).
 * They are ideas for inspiration, not products of the bakery. Names and
 * origins of the visible recipes are translated to Spanish on the fly.
 */
export default function InspirationPage() {
  const recipes = useAsync(fetchDessertRecipes, 'desserts')
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [showOriginal, setShowOriginal] = useState(false)

  // search matches the original name or its Spanish translation (once translated)
  const results = useMemo(() => {
    const q = normalize(query.trim())
    const list = recipes.data ?? []
    return q ? list.filter((r) => normalize(`${r.name} ${toSpanish(r.name)}`).includes(q)) : list
  }, [recipes.data, query])

  // translate only what is on screen (12 at a time) to spend little of the free quota
  const visible = results.slice(0, limit)
  const translation = useAsync(
    (signal) => translateToSpanish(visible.flatMap((r) => [r.name, r.area ?? '']), signal),
    recipes.status === 'success' ? visible.map((r) => r.id).join(',') : 'pending',
  )
  const waitingFirstTranslation =
    !showOriginal && translation.status === 'loading' && !visible.some((r) => hasSpanish(r.name))

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
              · categoría <b>Dessert</b> · traducidas automáticamente del inglés
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
                    ? `Ninguna receta de postre contiene “${query}”. Prueba con otra palabra, en español o en inglés (por ejemplo “chocolate”).`
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
                <TranslationNotice
                  translation={translation}
                  showOriginal={showOriginal}
                  onToggle={() => setShowOriginal((v) => !v)}
                />
                {waitingFirstTranslation ? (
                  <ApiLoading label="Traduciendo recetas al español…" />
                ) : (
                  <div className="recipes__grid">
                    <AnimatePresence mode="popLayout">
                      {visible.map((recipe, i) => (
                        <RecipeCard
                          key={recipe.id}
                          recipe={recipe}
                          spanish={!showOriginal}
                          variant={VARIANTS[i % VARIANTS.length]}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
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

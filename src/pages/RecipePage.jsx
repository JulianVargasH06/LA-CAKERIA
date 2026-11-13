import { useState } from 'react'
import { motion } from 'motion/react'
import { Link, useParams } from 'react-router'
import { Button, Label } from 'semantic-ui-react'
import { ApiEmpty, ApiError, ApiLoading } from '../components/ApiState'
import { ArrowIcon } from '../components/Icons'
import { PagePanel } from '../components/PagePanel'
import Reveal from '../components/Reveal'
import TranslationNotice from '../components/TranslationNotice'
import { useAsync } from '../hooks/useAsync'
import { fetchRecipe, MEALDB_SITE, recipeThumb } from '../services/mealdb'
import { toSpanish, translateToSpanish } from '../services/translate'

const EASE = [0.22, 1, 0.36, 1]
const CATEGORY_ES = { Dessert: 'Postre' }

/** Every text of a recipe that is shown on the page (sent to the translator). */
const recipeTexts = (r) => [
  r.name,
  r.area ?? '',
  ...r.tags,
  ...r.ingredients.flatMap((ing) => [ing.name, ing.measure]),
  ...r.steps,
]

/**
 * "/inspiracion/:recipeId" — one recipe, looked up live in TheMealDB and
 * translated to Spanish on the fly (the original stays one click away).
 */
export default function RecipePage() {
  const { recipeId } = useParams()
  const recipe = useAsync((signal) => fetchRecipe(recipeId, signal), recipeId)
  const translation = useAsync(
    (signal) => (recipe.data ? translateToSpanish(recipeTexts(recipe.data), signal) : Promise.resolve('cache')),
    recipe.data ? `recipe-${recipe.data.id}` : 'pending',
  )
  const [showOriginal, setShowOriginal] = useState(false)
  const translating = !showOriginal && recipe.data && translation.status === 'loading'

  if (recipe.status !== 'success' || !recipe.data || translating) {
    return (
      <>
        <title>Inspiración dulce — La Cakería</title>
        <PagePanel className="detail detail--status">
          <div className="detail__status">
            {recipe.status === 'loading' && <ApiLoading label="Cargando receta desde TheMealDB…" count={2} />}
            {translating && <ApiLoading label="Traduciendo la receta al español…" count={2} />}
            {recipe.status === 'error' && (
              <ApiError title="No pudimos cargar la receta" error={recipe.error} onRetry={recipe.retry} />
            )}
            {recipe.status === 'success' && !recipe.data && (
              <ApiEmpty title="Receta no encontrada" text="TheMealDB no tiene una receta con este identificador.">
                <Button as={Link} to="/inspiracion" className="ck-btn ck-btn--dark">
                  Ver otras recetas
                </Button>
              </ApiEmpty>
            )}
          </div>
        </PagePanel>
      </>
    )
  }

  const r = recipe.data
  const t = (text) => (showOriginal ? text : toSpanish(text))
  const lang = showOriginal || translation.status === 'error' ? 'en' : 'es'

  return (
    <>
      <title>{`${t(r.name)} — Inspiración dulce`}</title>
      <PagePanel className="detail" labelledBy="recipe-title">
        <motion.div
          className="detail__media"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: EASE }}
        >
          <img src={recipeThumb(r.image, 'large')} alt={t(r.name)} />
          <span className="recipe__badge recipe__badge--lg">TheMealDB</span>
        </motion.div>

        <motion.div
          className="detail__body"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: EASE }}
        >
          <nav className="detail__crumbs" aria-label="Ruta de navegación">
            <Link to="/inspiracion">Inspiración dulce</Link>
            <span aria-hidden="true">/</span>
            <span>{CATEGORY_ES[r.category] ?? r.category}</span>
          </nav>
          <p className="eyebrow">Receta externa · TheMealDB</p>
          <h1 className="detail__title" id="recipe-title" lang={lang}>
            {t(r.name)}
          </h1>

          <dl className="detail__facts">
            {r.area && (
              <div>
                <dt>Origen</dt>
                <dd>{t(r.area)}</dd>
              </div>
            )}
            <div>
              <dt>Ingredientes</dt>
              <dd>{r.ingredients.length}</dd>
            </div>
            {r.tags.length > 0 && (
              <div>
                <dt>Etiquetas</dt>
                <dd className="detail__tags">
                  {r.tags.map((tag) => (
                    <Label key={tag} className="ck-tag">
                      {t(tag)}
                    </Label>
                  ))}
                </dd>
              </div>
            )}
          </dl>
          <p className="detail__note">
            Receta obtenida en tiempo real de{' '}
            <a href={MEALDB_SITE} target="_blank" rel="noreferrer">
              TheMealDB
            </a>
            . No es un producto de La Cakería.
          </p>
          <TranslationNotice
            translation={translation}
            showOriginal={showOriginal}
            onToggle={() => setShowOriginal((v) => !v)}
          />

          <div className="detail__actions">
            {r.source && (
              <Button as="a" href={r.source} target="_blank" rel="noreferrer" className="ck-btn ck-btn--red ck-btn--lg">
                Fuente original <ArrowIcon />
              </Button>
            )}
            <Button as={Link} to="/inspiracion" className="ck-btn ck-btn--outline ck-btn--lg">
              Volver a las recetas
            </Button>
          </div>
        </motion.div>
      </PagePanel>

      <section className="sheet recipe-detail" aria-label="Preparación">
        <div className="section__inner recipe-detail__inner">
          <div className="recipe-detail__ingredients">
            <Reveal as="h2" className="recipe-detail__title">
              Ingredientes
            </Reveal>
            <ul lang={lang}>
              {r.ingredients.map((ing, i) => (
                <li key={`${ing.name}-${i}`}>
                  <span>{t(ing.name)}</span>
                  <b>{t(ing.measure)}</b>
                </li>
              ))}
            </ul>
          </div>
          <div className="recipe-detail__steps">
            <Reveal as="h2" className="recipe-detail__title">
              Preparación
            </Reveal>
            <ol lang={lang}>
              {r.steps.map((step, i) => (
                <li key={i}>{t(step)}</li>
              ))}
            </ol>
            {r.video && (
              <a className="recipe-detail__video" href={r.video} target="_blank" rel="noreferrer">
                Ver video de la receta <ArrowIcon />
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

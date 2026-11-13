import { useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { recipeThumb } from '../services/mealdb'
import { toSpanish } from '../services/translate'
import { ArrowIcon } from './Icons'

/**
 * Dessert recipe from TheMealDB. Same visual language as ProductCard (organic
 * photo mask, editorial type) but clearly labelled as an external recipe and
 * without price or cart actions.
 */
export default function RecipeCard({ recipe, variant = 'square', spanish = true, ref }) {
  const [loaded, setLoaded] = useState(false)
  const to = `/inspiracion/${recipe.id}`
  // translated text comes from the translation cache; falls back to the original
  const name = spanish ? toSpanish(recipe.name) : recipe.name
  const area = recipe.area && (spanish ? toSpanish(recipe.area) : recipe.area)

  return (
    <motion.article
      ref={ref}
      className={`product recipe product--${variant}`}
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={to} className={`product__media ${loaded ? 'is-loaded' : ''}`} tabIndex={-1} aria-hidden="true">
        <img
          src={recipeThumb(recipe.image)}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
        <span className="recipe__badge">TheMealDB</span>
      </Link>
      <div className="product__body">
        <p className="product__tagline">{area ? `Receta · ${area}` : 'Receta externa'}</p>
        <h2 className="product__name" lang={spanish ? 'es' : 'en'}>
          <Link to={to}>{name}</Link>
        </h2>
        <Link to={to} className="recipe__more">
          Ver receta <ArrowIcon />
        </Link>
      </div>
    </motion.article>
  )
}

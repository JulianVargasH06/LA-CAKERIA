/**
 * TheMealDB client — https://www.themealdb.com/api.php
 *
 * Public recipe API. We use the free test key "1", which TheMealDB documents
 * for development and educational use. Endpoints used:
 *   GET /filter.php?c=Dessert   → list of dessert recipes (id, name, photo)
 *   GET /lookup.php?i={id}      → full recipe (ingredients, instructions, source)
 *
 * Responses are normalised into small objects so components never depend on
 * the API's field names (strMeal, strIngredient1…).
 */
const API_KEY = '1'
const BASE_URL = `https://www.themealdb.com/api/json/v1/${API_KEY}`

export const MEALDB_SITE = 'https://www.themealdb.com'

async function request(path, signal) {
  const response = await fetch(`${BASE_URL}/${path}`, { signal })
  if (!response.ok) {
    throw new Error(`TheMealDB respondió con el código ${response.status}`)
  }
  return response.json()
}

/** TheMealDB serves resized photos when "/small", "/medium" or "/large" is appended. */
export const recipeThumb = (url, size = 'medium') => (url ? `${url}/${size}` : url)

/** All recipes in the "Dessert" category. */
export async function fetchDessertRecipes(signal) {
  const data = await request('filter.php?c=Dessert', signal)
  return (data.meals ?? []).map((meal) => ({
    id: meal.idMeal,
    name: meal.strMeal,
    image: meal.strMealThumb,
    area: meal.strArea || null,
  }))
}

/** One recipe by id, or null when TheMealDB has no recipe with that id. */
export async function fetchRecipe(id, signal) {
  const data = await request(`lookup.php?i=${encodeURIComponent(id)}`, signal)
  const meal = data.meals?.[0]
  return meal ? normalizeRecipe(meal) : null
}

function normalizeRecipe(meal) {
  const ingredients = []
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]?.trim()
    if (name) ingredients.push({ name, measure: meal[`strMeasure${i}`]?.trim() ?? '' })
  }

  const steps = (meal.strInstructions ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    // drop empty lines and bare "STEP 1" style headings
    .filter((line) => line && !/^(step\s*)?\d+\.?$/i.test(line))

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    image: meal.strMealThumb,
    category: meal.strCategory,
    area: meal.strArea || null,
    tags: meal.strTags ? meal.strTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    ingredients,
    steps,
    source: meal.strSource || null,
    video: meal.strYoutube || null,
  }
}

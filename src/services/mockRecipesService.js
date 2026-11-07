let recipes = [
  {
    id: 'mock-recipe-1',
    userId: 'mock-user',
    name: 'Bowl tibio de quinoa',
    description: 'Una opción simple y liviana para cualquier momento del día.',
    ingredients: ['quinoa', 'zanahoria', 'espinaca', 'huevo'],
    steps: ['Cocinar la quinoa.', 'Saltear la zanahoria y la espinaca.', 'Servir con el huevo.'],
    time: '25 min',
    tags: ['Fácil', 'Sin gluten'],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'mock-recipe-2',
    userId: 'mock-user',
    name: 'Pollo con verduras',
    description: 'Receta práctica para preparar con ingredientes cotidianos.',
    ingredients: ['pollo', 'zapallito', 'zanahoria', 'aceite de oliva'],
    steps: ['Cortar los ingredientes.', 'Cocinar el pollo.', 'Agregar las verduras y terminar la cocción.'],
    time: '30 min',
    tags: ['Almuerzo'],
    createdAt: '2026-01-02T00:00:00.000Z',
  },
]

function cloneRecipe(recipe) {
  return {
    ...recipe,
    ingredients: [...recipe.ingredients],
    steps: [...recipe.steps],
    tags: [...recipe.tags],
  }
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

export async function getPublicRecipes() {
  return recipes.map(cloneRecipe)
}

export async function createRecipe({ name, description = '', ingredients = [], steps = [], time = '', tags = [] }) {
  const recipe = {
    id: `mock-recipe-${Date.now()}`,
    userId: 'mock-user',
    name,
    description,
    ingredients: normalizeArray(ingredients),
    steps: normalizeArray(steps),
    time,
    tags: normalizeArray(tags),
    createdAt: new Date().toISOString(),
  }
  recipes = [recipe, ...recipes]
  return cloneRecipe(recipe)
}

export async function updateRecipe({ id, name, description = '', ingredients = [], steps = [], time = '', tags = [] }) {
  const index = recipes.findIndex((recipe) => recipe.id === id)
  if (index < 0) throw new Error('La receta no existe en los datos temporales.')

  recipes[index] = {
    ...recipes[index],
    name,
    description,
    ingredients: normalizeArray(ingredients),
    steps: normalizeArray(steps),
    time,
    tags: normalizeArray(tags),
  }
  return cloneRecipe(recipes[index])
}

export async function deleteRecipe({ id }) {
  recipes = recipes.filter((recipe) => recipe.id !== id)
}

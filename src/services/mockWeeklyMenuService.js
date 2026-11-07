function getMonday(date) {
  const monday = new Date(date)
  monday.setHours(0, 0, 0, 0)
  const day = monday.getDay()
  monday.setDate(monday.getDate() - ((day + 6) % 7))
  return monday
}

function addDays(date, amount) {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

function formatDateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

function cloneMeal(meal) {
  return { ...meal, ingredients: [...meal.ingredients] }
}

const currentWeek = getMonday(new Date())
let meals = [
  {
    id: 'mock-meal-1',
    userId: 'mock-user',
    date: formatDateKey(currentWeek),
    mealType: 'desayuno',
    name: 'Bowl tibio de quinoa',
    ingredients: ['quinoa', 'zanahoria', 'espinaca', 'huevo'],
  },
  {
    id: 'mock-meal-2',
    userId: 'mock-user',
    date: formatDateKey(addDays(currentWeek, 2)),
    mealType: 'cena',
    name: 'Pollo con verduras',
    ingredients: ['pollo', 'zapallito', 'zanahoria'],
  },
]

export async function getWeeklyMenu({ startDate, endDate }) {
  return meals.filter((meal) => meal.date >= startDate && meal.date <= endDate).map(cloneMeal)
}

export async function createMeal({ date, mealType, recipeName, ingredients = [] }) {
  const meal = {
    id: `mock-meal-${Date.now()}`,
    userId: 'mock-user',
    date,
    mealType,
    name: recipeName,
    ingredients: Array.isArray(ingredients) ? ingredients.filter(Boolean) : [],
  }
  meals = [...meals, meal]
  return cloneMeal(meal)
}

export async function updateMeal({ id, date, mealType, recipeName, ingredients = [] }) {
  const index = meals.findIndex((meal) => meal.id === id)
  if (index < 0) throw new Error('La comida no existe en los datos temporales.')

  meals[index] = {
    ...meals[index],
    date,
    mealType,
    name: recipeName,
    ingredients: Array.isArray(ingredients) ? ingredients.filter(Boolean) : [],
  }
  return cloneMeal(meals[index])
}

export async function moveOrSwapMeals({ sourceId, sourceDate, sourceMealType, targetId = null, targetDate, targetMealType }) {
  const source = meals.find((meal) => meal.id === sourceId)
  if (!source || source.date !== sourceDate || source.mealType !== sourceMealType) {
    throw new Error('La comida origen no existe en los datos temporales.')
  }

  const target = targetId
    ? meals.find((meal) => meal.id === targetId)
    : meals.find((meal) => meal.id !== sourceId && meal.date === targetDate && meal.mealType === targetMealType)

  const sourcePosition = { date: source.date, mealType: source.mealType }
  source.date = targetDate
  source.mealType = targetMealType

  if (target) {
    target.date = sourcePosition.date
    target.mealType = sourcePosition.mealType
  }

  return [cloneMeal(source), ...(target ? [cloneMeal(target)] : [])]
}

export async function deleteMeal({ id }) {
  meals = meals.filter((meal) => meal.id !== id)
}

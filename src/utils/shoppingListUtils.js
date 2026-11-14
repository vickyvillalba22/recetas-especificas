import { getShoppingUnitLabel } from './shoppingUnits'

export function getMealIngredients(meal) {
  return Array.isArray(meal?.ingredients) ? meal.ingredients : []
}

export function getShoppingItemKey(item) {
  return `${String(item?.name || '').trim().toLocaleLowerCase()}::${item?.unit || 'unidad'}`
}

const ingredientUnitAliases = {
  kg: 'kg',
  kilo: 'kg',
  kilos: 'kg',
  kilogramo: 'kg',
  kilogramos: 'kg',
  g: 'g',
  gr: 'g',
  gramo: 'g',
  gramos: 'g',
  l: 'litro',
  litro: 'litro',
  litros: 'litro',
  ml: 'ml',
  mililitro: 'ml',
  mililitros: 'ml',
  unidad: 'unidad',
  unidades: 'unidad',
  paquete: 'paquete',
  paquetes: 'paquete',
  botella: 'botella',
  botellas: 'botella',
  lata: 'lata',
  latas: 'lata',
  docena: 'docena',
  docenas: 'docena',
  cucharada: 'cucharada',
  cucharadas: 'cucharada',
  cucharadita: 'cucharadita',
  cucharaditas: 'cucharadita',
}

const ingredientUnitPattern = Object.keys(ingredientUnitAliases)
  .sort((first, second) => second.length - first.length)
  .join('|')

export function parseMenuIngredient(ingredient) {
  if (ingredient && typeof ingredient === 'object') {
    return {
      name: String(ingredient.name || '').trim(),
      quantity: Math.max(0.01, Number(ingredient.quantity) || 1),
      unit: ingredient.unit || 'unidad',
    }
  }

  const value = String(ingredient || '').trim()
  const match = value.match(new RegExp(`^(\\s*)(\\d+(?:[.,]\\d+)?)\\s*(${ingredientUnitPattern})\\s+(?:de\\s+)?(.+?)\\s*$`, 'i'))
  if (match) {
    return {
      name: match[4].trim(),
      quantity: Math.max(0.01, Number(match[2].replace(',', '.')) || 1),
      unit: ingredientUnitAliases[match[3].toLocaleLowerCase()] || 'unidad',
    }
  }

  const quantityOnlyMatch = value.match(/^\s*(\d+(?:[.,]\d+)?)\s+(?:de\s+)?(.+?)\s*$/i)
  if (!quantityOnlyMatch) return { name: value, quantity: 1, unit: 'unidad' }

  return {
    name: quantityOnlyMatch[2].trim(),
    quantity: Math.max(0.01, Number(quantityOnlyMatch[1].replace(',', '.')) || 1),
    unit: 'unidad',
  }
}

export function groupShoppingItems(ingredients = []) {
  const grouped = new Map()
  ingredients.forEach((ingredient) => {
    const parsedIngredient = parseMenuIngredient(ingredient)
    const name = parsedIngredient.name
    if (!name) return
    const unit = parsedIngredient.unit || 'unidad'
    const quantity = parsedIngredient.quantity || 1
    const key = `${name.toLocaleLowerCase()}::${unit}`
    const current = grouped.get(key)
    grouped.set(key, current
      ? { ...current, quantity: current.quantity + quantity }
      : { name, quantity, unit, checked: false })
  })
  return [...grouped.values()]
}

export function getShoppingItems(menu) {
  const ingredients = []
  Object.values(menu).forEach((day) =>
    Object.values(day).forEach((meal) => ingredients.push(...getMealIngredients(meal))),
  )
  return groupShoppingItems(ingredients)
}

export function mergeShoppingItems(items, additions = []) {
  const merged = items.map((item) => ({ ...item }))
  const indexes = new Map(merged.map((item, index) => [getShoppingItemKey(item), index]))

  additions.forEach((item) => {
    const key = getShoppingItemKey(item)
    const index = indexes.get(key)
    if (index === undefined) {
      indexes.set(key, merged.length)
      merged.push({ ...item, quantity: Number(item.quantity) || 1, unit: item.unit || 'unidad', checked: false })
      return
    }
    merged[index] = { ...merged[index], quantity: (Number(merged[index].quantity) || 1) + (Number(item.quantity) || 1) }
  })

  return merged
}

export function removeShoppingIngredients(items, ingredients) {
  const removals = new Map(groupShoppingItems(ingredients).map((item) => [getShoppingItemKey(item), item.quantity]))
  return items.flatMap((item) => {
    const itemKey = getShoppingItemKey(item)
    const removalCount = removals.get(itemKey)
    if (!removalCount) return [item]
    const itemQuantity = Number(item.quantity) || 1
    const remainingCount = itemQuantity - removalCount
    if (remainingCount > 0) {
      removals.set(itemKey, 0)
      return [{ ...item, quantity: remainingCount }]
    }
    const nextRemovalCount = removalCount - itemQuantity
    if (nextRemovalCount > 0) removals.set(itemKey, nextRemovalCount)
    else removals.delete(itemKey)
    return []
  })
}

export function replaceShoppingIngredients(items, previousIngredients, nextIngredients) {
  return mergeShoppingItems(
    removeShoppingIngredients(items, previousIngredients),
    groupShoppingItems(nextIngredients),
  )
}

export function formatShoppingItem(item) {
  return `${item.name} — ${item.quantity} ${getShoppingUnitLabel(item.unit, item.quantity)}`
}

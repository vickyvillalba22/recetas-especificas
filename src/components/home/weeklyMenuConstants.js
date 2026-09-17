export const mealTimes = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena']
export const CROSS_WEEK_DRAG_ENABLED = false

export function getMealDragId(mealId, view) {
  return `meal-${mealId}-${view}`
}

export function getSlotDropId(dayIndex, mealIndex, view) {
  return `slot-${dayIndex}-${mealIndex}-${view}`
}

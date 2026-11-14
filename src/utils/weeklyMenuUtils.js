export const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export const initialMenu = Object.fromEntries(
  weekdays.map((day) => [day, { Desayuno: null, Almuerzo: null, Merienda: null, Cena: null }]),
)

export function getMonday(date) {
  const monday = new Date(date)
  monday.setHours(0, 0, 0, 0)
  const day = monday.getDay()
  monday.setDate(monday.getDate() - ((day + 6) % 7))
  return monday
}

export function addDays(date, amount) {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

export function formatDateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

export function formatWeekRange(start) {
  const end = addDays(start, 6)
  const startMonth = start.toLocaleDateString('es-ES', { month: 'long' })
  const endMonth = end.toLocaleDateString('es-ES', { month: 'long' })
  return startMonth === endMonth
    ? `${start.getDate()} — ${end.getDate()} de ${endMonth}`
    : `${start.getDate()} de ${startMonth} — ${end.getDate()} de ${endMonth}`
}

export function formatDayName(date) {
  return date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')
}

export function formatMonthShort(date) {
  return date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase()
}

export function menuFromRows(rows, weekStart) {
  const menu = Object.fromEntries(weekdays.map((day) => [day, { ...initialMenu[day] }]))
  const mealNames = {
    desayuno: 'Desayuno',
    almuerzo: 'Almuerzo',
    merienda: 'Merienda',
    cena: 'Cena',
  }
  const dates = Array.from({ length: 7 }, (_, index) => formatDateKey(addDays(weekStart, index)))

  rows.forEach((row) => {
    const dayIndex = dates.indexOf(row.date)
    const mealName = mealNames[String(row.mealType).toLowerCase()]
    if (dayIndex < 0 || !mealName) return
    menu[weekdays[dayIndex]][mealName] = {
      id: row.id,
      name: row.name,
      ingredients: row.ingredients,
    }
  })

  return menu
}

export function swapMenuSlots(menu, source, target, mealTimes) {
  const sourceDay = weekdays[source.dayIndex]
  const targetDay = weekdays[target.dayIndex]
  const sourceMeal = mealTimes[source.mealIndex]
  const targetMeal = mealTimes[target.mealIndex]
  const sourceValue = menu[sourceDay]?.[sourceMeal]
  const targetValue = menu[targetDay]?.[targetMeal]

  if (!sourceValue) return menu

  if (sourceDay === targetDay) {
    return {
      ...menu,
      [sourceDay]: {
        ...menu[sourceDay],
        [sourceMeal]: targetValue,
        [targetMeal]: sourceValue,
      },
    }
  }

  return {
    ...menu,
    [sourceDay]: { ...menu[sourceDay], [sourceMeal]: targetValue },
    [targetDay]: { ...menu[targetDay], [targetMeal]: sourceValue },
  }
}

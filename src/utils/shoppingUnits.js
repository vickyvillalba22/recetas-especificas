export const shoppingUnits = [
  { value: 'unidad', label: 'unidad' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'litro', label: 'litro' },
  { value: 'ml', label: 'ml' },
  { value: 'paquete', label: 'paquete' },
  { value: 'botella', label: 'botella' },
  { value: 'lata', label: 'lata' },
  { value: 'docena', label: 'docena' },
  { value: 'cucharada', label: 'cucharada' },
  { value: 'cucharadita', label: 'cucharadita' },
]

export function getShoppingUnitLabel(unit, quantity = 1) {
  const selectedUnit = shoppingUnits.find((option) => option.value === unit)?.label || unit || 'unidad'
  if (quantity === 1) return selectedUnit
  if (selectedUnit === 'unidad') return 'unidades'
  if (selectedUnit === 'litro') return 'litros'
  if (selectedUnit === 'botella') return 'botellas'
  if (selectedUnit === 'lata') return 'latas'
  if (selectedUnit === 'paquete') return 'paquetes'
  if (selectedUnit === 'docena') return 'docenas'
  if (selectedUnit === 'cucharada') return 'cucharadas'
  if (selectedUnit === 'cucharadita') return 'cucharaditas'
  return selectedUnit
}

export function formatShoppingQuantity(quantity) {
  const parsedQuantity = Number(quantity)
  if (!Number.isFinite(parsedQuantity)) return '1'
  return String(parsedQuantity)
}

'use client'

import { useState } from 'react'
import { saveShoppingList } from '../services/home/shoppingListService'
import {
  formatShoppingItem,
  getShoppingItemKey,
  mergeShoppingItems,
  removeShoppingIngredients,
  replaceShoppingIngredients,
} from '../utils/shoppingListUtils'
import { formatDateKey } from '../utils/weeklyMenuUtils'

export function useShoppingList({ weekStart, setMenuError }) {
  const [shoppingItems, setShoppingItems] = useState([])
  const [showClearListModal, setShowClearListModal] = useState(false)
  const [showAddShoppingModal, setShowAddShoppingModal] = useState(false)
  const [shoppingItemSaving, setShoppingItemSaving] = useState(false)
  const [shoppingModalError, setShoppingModalError] = useState('')
  const [copied, setCopied] = useState(false)
  const checked = shoppingItems.filter((item) => item.checked).map(getShoppingItemKey)

  const loadShoppingItems = async (items) => {
    setShoppingItems(items)
    return items
  }

  const replaceMealIngredients = async (previousIngredients, nextIngredients) => {
    const nextItems = replaceShoppingIngredients(shoppingItems, previousIngredients, nextIngredients)
    setShoppingItems(nextItems)
    await saveShoppingList({ weekId: formatDateKey(weekStart), items: nextItems })
    return nextItems
  }

  const removeIngredientsFromShoppingList = async (ingredients) => {
    if (!ingredients.length) return shoppingItems
    const nextItems = removeShoppingIngredients(shoppingItems, ingredients)
    if (JSON.stringify(nextItems) === JSON.stringify(shoppingItems)) return shoppingItems
    setShoppingItems(nextItems)
    await saveShoppingList({ weekId: formatDateKey(weekStart), items: nextItems })
    return nextItems
  }

  const copyShoppingList = async () => {
    if (!shoppingItems.length) return
    const text = `Lista de compras · sibo.decis\n${shoppingItems.map((item) => `- ${formatShoppingItem(item)}`).join('\n')}`
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const fallback = document.createElement('textarea')
      fallback.value = text
      document.body.appendChild(fallback)
      fallback.select()
      document.execCommand('copy')
      document.body.removeChild(fallback)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const toggleShoppingItem = async (targetItem) => {
    const targetKey = getShoppingItemKey(targetItem)
    const nextItems = shoppingItems.map((item) => getShoppingItemKey(item) === targetKey ? { ...item, checked: !item.checked } : item)
    setShoppingItems(nextItems)
    try {
      await saveShoppingList({ weekId: formatDateKey(weekStart), items: nextItems })
    } catch (error) {
      setMenuError(error.message)
    }
  }

  const changeShoppingItemQuantity = async (targetItem, delta) => {
    const targetKey = getShoppingItemKey(targetItem)
    const currentItem = shoppingItems.find((item) => getShoppingItemKey(item) === targetKey)
    if (!currentItem) return
    const nextQuantity = (Number(currentItem.quantity) || 1) + delta
    const nextItems = nextQuantity > 0
      ? shoppingItems.map((item) => getShoppingItemKey(item) === targetKey ? { ...item, quantity: nextQuantity } : item)
      : shoppingItems.filter((item) => getShoppingItemKey(item) !== targetKey)
    setShoppingItems(nextItems)
    try {
      await saveShoppingList({ weekId: formatDateKey(weekStart), items: nextItems })
    } catch (error) {
      setMenuError(error.message)
    }
  }

  const changeShoppingItemUnit = async (targetItem, unit) => {
    const targetKey = getShoppingItemKey(targetItem)
    const currentItem = shoppingItems.find((item) => getShoppingItemKey(item) === targetKey)
    if (!currentItem || currentItem.unit === unit) return
    const duplicate = shoppingItems.find((item) => getShoppingItemKey(item) === `${currentItem.name.trim().toLocaleLowerCase()}::${unit}`)
    const nextItems = duplicate
      ? shoppingItems
          .filter((item) => getShoppingItemKey(item) !== targetKey)
          .map((item) => getShoppingItemKey(item) === getShoppingItemKey(duplicate) ? { ...item, quantity: (Number(item.quantity) || 1) + (Number(currentItem.quantity) || 1) } : item)
      : shoppingItems.map((item) => getShoppingItemKey(item) === targetKey ? { ...item, unit } : item)
    setShoppingItems(nextItems)
    try {
      await saveShoppingList({ weekId: formatDateKey(weekStart), items: nextItems })
    } catch (error) {
      setMenuError(error.message)
    }
  }

  const openAddShoppingModal = () => {
    setShoppingModalError('')
    setShowAddShoppingModal(true)
  }

  const addManualShoppingItems = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const names = form.getAll('ingredientName')
    const quantities = form.getAll('ingredientQuantity')
    const units = form.getAll('ingredientUnit')
    const additions = names
      .map((value, index) => ({
        name: String(value || '').trim(),
        quantity: Math.max(0.01, Number(quantities[index]) || 1),
        unit: String(units[index] || 'unidad'),
      }))
      .filter((item) => item.name)

    if (!additions.length) {
      setShoppingModalError('Ingresá al menos un ingrediente.')
      return
    }

    setShoppingItemSaving(true)
    setShoppingModalError('')
    const previousItems = shoppingItems
    const nextItems = mergeShoppingItems(shoppingItems, additions)
    setShoppingItems(nextItems)
    try {
      await saveShoppingList({ weekId: formatDateKey(weekStart), items: nextItems })
      setShowAddShoppingModal(false)
    } catch (error) {
      setShoppingItems(previousItems)
      setShoppingModalError(error.message)
    } finally {
      setShoppingItemSaving(false)
    }
  }

  const clearShoppingList = () => {
    if (shoppingItems.length) setShowClearListModal(true)
  }

  const confirmClearShoppingList = async () => {
    setShowClearListModal(false)
    setShoppingItems([])
    try {
      await saveShoppingList({ weekId: formatDateKey(weekStart), items: [] })
    } catch (error) {
      setMenuError(error.message)
    }
  }

  return {
    shoppingItems,
    checked,
    showClearListModal,
    showAddShoppingModal,
    shoppingItemSaving,
    shoppingModalError,
    copied,
    loadShoppingItems,
    replaceMealIngredients,
    removeIngredientsFromShoppingList,
    toggleShoppingItem,
    changeShoppingItemQuantity,
    changeShoppingItemUnit,
    copyShoppingList,
    openAddShoppingModal,
    addManualShoppingItems,
    clearShoppingList,
    confirmClearShoppingList,
    closeAddShoppingModal: () => setShowAddShoppingModal(false),
    closeClearListModal: () => setShowClearListModal(false),
  }
}

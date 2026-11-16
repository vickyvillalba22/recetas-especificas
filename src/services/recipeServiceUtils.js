import { firebaseTimestampToISOString } from './firestoreService'

export function normalizeRecipeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

export function mapRecipeSnapshot(snapshot) {
  const data = snapshot.data()
  return {
    id: snapshot.id,
    userId: data.userId || data.createdBy || '',
    name: data.name || '',
    description: data.description || '',
    ingredients: normalizeRecipeArray(data.ingredients),
    steps: normalizeRecipeArray(data.steps),
    time: data.time || '',
    tags: normalizeRecipeArray(data.tags),
    imageUrl: data.imageUrl || '',
    origin: data.origin || '',
    aiWarning: data.aiWarning || '',
    published: data.published !== false,
    createdAt: firebaseTimestampToISOString(data.createdAt),
    updatedAt: firebaseTimestampToISOString(data.updatedAt),
  }
}

export function recipePayload({ name, description = '', ingredients = [], steps = [], time = '', tags = [], imageUrl = '', origin = '', aiWarning = '' }) {
  return {
    name,
    description,
    ingredients: normalizeRecipeArray(ingredients),
    steps: normalizeRecipeArray(steps),
    time,
    tags: normalizeRecipeArray(tags),
    imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : '',
    origin,
    aiWarning,
  }
}

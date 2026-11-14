import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const COLLECTION_NAME = 'publicRecipes'
const SEED_AUTHOR = 'seed:sibo'
const DATA_FILE = resolve(process.cwd(), 'data', 'recipes.json')
const isDryRun = process.argv.includes('--dry-run')

function getFirebaseConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Faltan FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL o FIREBASE_PRIVATE_KEY en .env.local.',
    )
  }

  return { projectId, clientEmail, privateKey }
}

function assertString(value, field, recipeId) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`La receta ${recipeId} necesita un campo de texto válido: ${field}.`)
  }
}

function assertStringArray(value, field, recipeId) {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new Error(`La receta ${recipeId} necesita un array de textos válido: ${field}.`)
  }
}

function validateRecipes(recipes) {
  if (!Array.isArray(recipes) || recipes.length === 0) {
    throw new Error('data/recipes.json debe contener un array no vacío de recetas.')
  }

  const ids = new Set()

  for (const recipe of recipes) {
    if (!recipe || typeof recipe !== 'object') {
      throw new Error('Cada elemento de data/recipes.json debe ser un objeto.')
    }

    assertString(recipe.id, 'id', recipe.id || 'sin-id')
    assertString(recipe.name, 'name', recipe.id)
    assertString(recipe.description, 'description', recipe.id)
    assertString(recipe.time, 'time', recipe.id)
    assertStringArray(recipe.ingredients, 'ingredients', recipe.id)
    assertStringArray(recipe.steps, 'steps', recipe.id)
    assertStringArray(recipe.tags, 'tags', recipe.id)

    if (ids.has(recipe.id)) {
      throw new Error(`El id de receta está repetido: ${recipe.id}.`)
    }

    if (typeof recipe.published !== 'boolean') {
      throw new Error(`La receta ${recipe.id} necesita published como booleano.`)
    }

    ids.add(recipe.id)
  }
}

async function readRecipes() {
  const content = await readFile(DATA_FILE, 'utf8')
  const recipes = JSON.parse(content)
  validateRecipes(recipes)
  return recipes
}

function createAdminApp() {
  const config = getFirebaseConfig()
  return getApps().length ? getApps()[0] : initializeApp({ credential: cert(config) })
}

const recipes = await readRecipes()

if (isDryRun) {
  console.log(`Validación correcta: ${recipes.length} recetas listas para cargar en ${COLLECTION_NAME}.`)
  console.log(recipes.map(({ id, name }) => `- ${id}: ${name}`).join('\n'))
  process.exit(0)
}

const db = getFirestore(createAdminApp())
const references = recipes.map((recipe) => db.collection(COLLECTION_NAME).doc(recipe.id))
const existingSnapshots = await db.getAll(...references)
const batch = db.batch()
let createdCount = 0
let updatedCount = 0

recipes.forEach((recipe, index) => {
  const existing = existingSnapshots[index]
  const payload = {
    name: recipe.name.trim(),
    description: recipe.description.trim(),
    ingredients: recipe.ingredients.map((item) => item.trim()),
    steps: recipe.steps.map((item) => item.trim()),
    time: recipe.time.trim(),
    tags: recipe.tags.map((tag) => tag.trim()),
    createdBy: SEED_AUTHOR,
    published: recipe.published,
    updatedAt: FieldValue.serverTimestamp(),
  }

  if (existing.exists) {
    updatedCount += 1
  } else {
    createdCount += 1
    payload.createdAt = FieldValue.serverTimestamp()
  }

  batch.set(references[index], payload, { merge: true })
})

await batch.commit()

console.log(`Carga completada en ${COLLECTION_NAME}.`)
console.log(`Recetas nuevas: ${createdCount}. Recetas actualizadas: ${updatedCount}.`)

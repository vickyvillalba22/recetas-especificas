import { useEffect, useState } from 'react'
import { RecipeFormModal } from '../components/home/RecipeFormModal'
import { RecipeGallery } from '../components/home/RecipeGallery'
import { Footer } from '../components/home/Footer'
import { createRecipe, deleteRecipe, getPublicRecipes, updateRecipe } from '../services/recipesService'
import { useNavigate } from 'react-router-dom'

export function RecipesPage() {
  const navigate = useNavigate(); const [recipes, setRecipes] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [formRecipe, setFormRecipe] = useState(null); const [formLoading, setFormLoading] = useState(false); const [formError, setFormError] = useState('')
  useEffect(() => { let active = true; getPublicRecipes().then((data) => { if (active) setRecipes(data) }).catch((loadError) => { if (active) setError(loadError.message) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [])
  const openForm = (recipe = {}) => { setFormError(''); setFormRecipe(recipe) }
  const closeForm = () => { setFormRecipe(null); setFormError('') }
  async function saveRecipe(event) { event.preventDefault(); const form = new FormData(event.currentTarget); const data = { name: form.get('name')?.trim(), description: form.get('description')?.trim(), ingredients: form.get('ingredients')?.split('\n').map((item) => item.trim()).filter(Boolean), steps: form.get('steps')?.split('\n').map((item) => item.trim()).filter(Boolean), time: form.get('time')?.trim(), tags: form.get('tags')?.split(',').map((tag) => tag.trim()).filter(Boolean) }; if (!data.name) return; setFormLoading(true); setFormError(''); try { const saved = formRecipe?.id ? await updateRecipe({ id: formRecipe.id, ...data }) : await createRecipe(data); setRecipes((current) => formRecipe?.id ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]); closeForm() } catch (saveError) { setFormError(saveError.message) } finally { setFormLoading(false) } }
  async function removeRecipe(recipe) { if (!window.confirm(`¿Eliminar la receta "${recipe.name}"?`)) return; try { await deleteRecipe({ id: recipe.id }); setRecipes((current) => current.filter((item) => item.id !== recipe.id)) } catch (deleteError) { setError(deleteError.message) } }
  return <div className="min-h-screen bg-cream text-ink dark:bg-ink-dark dark:text-cream"><main className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 lg:px-10 lg:pt-16"><button onClick={() => navigate('/')} className="mb-8 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold transition hover:bg-white dark:border-cream/15 dark:hover:bg-ink-soft">← Volver al menú</button><RecipeGallery recipes={recipes} loading={loading} error={error} onAddRecipe={() => openForm()} onEditRecipe={openForm} onDeleteRecipe={removeRecipe} onAddToMenu={(recipe) => navigate('/', { state: { recipeToAdd: recipe } })} /></main><Footer />{formRecipe && <RecipeFormModal recipe={formRecipe} onClose={closeForm} onSubmit={saveRecipe} loading={formLoading} error={formError} />}</div>
}

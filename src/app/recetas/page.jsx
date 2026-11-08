import { RecipesPageClient } from '../../components/recipes/RecipesPageClient'

export const metadata = {
  title: 'Recetas generales',
}

export default function PublicRecipesPage() {
  return <RecipesPageClient mode="public" />
}

import { RecipesPageClient } from '../../components/recipes/RecipesPageClient'

export const metadata = {
  title: 'Mis recetas',
}

export default function PersonalRecipesPage() {
  return <RecipesPageClient mode="personal" />
}

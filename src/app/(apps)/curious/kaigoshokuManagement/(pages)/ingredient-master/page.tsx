'use server'

import { IngredientMasterClient } from './IngredientMasterClient'
import { getIngredientMasters } from '../../_actions/ingredient-master-actions'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function IngredientMasterPage({ searchParams }: Props) {
  const query = await searchParams
  const search = typeof query.search === 'string' ? query.search : ''
  const category = typeof query.category === 'string' ? query.category : undefined

  const { masters, categories } = await getIngredientMasters({ search, category })

  return (
    <IngredientMasterClient
      initialMasters={masters}
      categories={categories}
      currentFilter={{ search, category }}
    />
  )
}

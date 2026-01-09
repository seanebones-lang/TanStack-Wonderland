import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Suspense } from 'react'

interface PokemonListItem {
  name: string
  url: string
}

interface PokemonListResponse {
  results: PokemonListItem[]
}

const fetchPokemonList = async (): Promise<PokemonListResponse> => {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20')
  if (!response.ok) {
    throw new Error('Failed to fetch Pokemon')
  }
  return response.json()
}

function PokemonGrid() {
  const { data, error, isPending } = useQuery({
    queryKey: ['pokemon'],
    queryFn: fetchPokemonList,
  })

  if (isPending) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 text-center py-12">
        Error loading Pokemon: {error.message}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
      {data?.results.map((pokemon) => (
        <div
          key={pokemon.name}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
              {pokemon.name}
            </h3>
          </div>
        </div>
      ))}
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: () => (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Welcome to TanStack Wonderland
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Explore the TanStack ecosystem with Pokemon data!
      </p>
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <PokemonGrid />
      </Suspense>
    </div>
  ),
})

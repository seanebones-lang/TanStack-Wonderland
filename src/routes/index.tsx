import { createFileRoute, Link } from '@tanstack/react-router'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

interface PokemonListItem {
  name: string
  url: string
}

interface PokemonResponse {
  results: PokemonListItem[]
  next: string | null
}

const fetchPokemon = async ({ pageParam = 0 }): Promise<PokemonResponse & { nextPage: number }> => {
  const limit = 20
  const offset = pageParam * limit
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
  if (!response.ok) {
    throw new Error('Failed to fetch Pokemon')
  }
  const data = await response.json()
  return {
    ...data,
    nextPage: data.next ? pageParam + 1 : undefined,
  }
}

// Skeleton Loader Component
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
    </div>
  )
}

function PokemonCard({ pokemon }: { pokemon: PokemonListItem; index: number }) {
  const queryClient = useQueryClient()
  const pokemonId = pokemon.url.split('/').filter(Boolean).pop()

  // Prefetch Pokemon detail on hover
  const handleMouseEnter = () => {
    if (pokemonId) {
      queryClient.prefetchQuery({
        queryKey: ['pokemon', pokemonId],
        queryFn: async () => {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
          if (!response.ok) throw new Error('Failed to fetch')
          return response.json()
        },
        staleTime: 5 * 60 * 1000,
      })
    }
  }

  return (
    <Link
      to="/pokemon/$id"
      params={{ id: pokemon.name }}
      onMouseEnter={handleMouseEnter}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label={`View details for ${pokemon.name}`}
    >
      <div className="text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-2 flex items-center justify-center">
          <span className="text-2xl">🦎</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
          {pokemon.name}
        </h3>
      </div>
    </Link>
  )
}

function PokemonGrid() {
  const [searchQuery, setSearchQuery] = useState('')
  const parentRef = useRef<HTMLDivElement>(null)

  const { data, error, isPending, fetchNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: ['pokemon', 'infinite'],
    queryFn: fetchPokemon,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount) => {
      if (failureCount < 3) return true
      return false
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data]
  )

  const filteredData = useMemo(() => {
    if (!searchQuery) return flatData
    return flatData.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [flatData, searchQuery])

  if (error) {
    return (
      <div
        role="alert"
        className="text-red-600 dark:text-red-400 text-center py-12 space-y-4"
      >
        <p className="text-lg font-semibold">Error loading Pokemon: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Retry loading Pokemon"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Pokemon..."
          aria-label="Search Pokemon"
          aria-describedby="search-help"
          className="w-full max-w-md px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        <div id="search-help" className="sr-only">
          Type to filter Pokemon by name
        </div>
      </div>

      {/* Grid with Infinite Scroll */}
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto"
        role="region"
        aria-label="Pokemon grid"
        tabIndex={0}
        onScroll={(e) => {
          const target = e.target as HTMLDivElement
          const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight
          if (scrollBottom < 200 && data?.pages[data.pages.length - 1].next && !isFetchingNextPage) {
            fetchNextPage()
          }
        }}
      >
        {isPending && !data ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredData.map((pokemon, index) => (
              <PokemonCard key={`${pokemon.name}-${index}`} pokemon={pokemon} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Loading More Indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center items-center py-4" role="status" aria-label="Loading more Pokemon">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        Showing {filteredData.length} of {flatData.length} Pokemon
        {searchQuery && ` matching "${searchQuery}"`}
      </div>
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
      <PokemonGrid />
    </div>
  ),
})

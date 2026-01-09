import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState, useEffect } from 'react'
import { useToast } from '../components/Toast'

interface PokemonDetail {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number
  types: Array<{
    type: {
      name: string
    }
  }>
  stats: Array<{
    base_stat: number
    stat: {
      name: string
    }
  }>
  sprites: {
    front_default: string | null
    front_shiny: string | null
  }
  abilities: Array<{
    ability: {
      name: string
    }
    is_hidden: boolean
  }>
}

const fetchPokemonDetail = async (id: string): Promise<PokemonDetail> => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon: ${id}`)
  }
  return response.json()
}

function SkeletonDetail() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="space-y-3">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/pokemon/$id')({
  component: PokemonDetailPage,
})

function PokemonDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showShiny, setShowShiny] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { showToast, ToastComponent } = useToast()

  const { data: pokemon, error, isPending, refetch } = useQuery({
    queryKey: ['pokemon', id],
    queryFn: () => fetchPokemonDetail(id),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount) => failureCount < 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Prefetch next/previous Pokemon
  useEffect(() => {
    if (pokemon?.id) {
      const nextId = pokemon.id + 1
      const prevId = Math.max(1, pokemon.id - 1)
      
      // Prefetch adjacent Pokemon
      queryClient.prefetchQuery({
        queryKey: ['pokemon', String(nextId)],
        queryFn: () => fetchPokemonDetail(String(nextId)),
        staleTime: 5 * 60 * 1000,
      })
      queryClient.prefetchQuery({
        queryKey: ['pokemon', String(prevId)],
        queryFn: () => fetchPokemonDetail(String(prevId)),
        staleTime: 5 * 60 * 1000,
      })
    }
  }, [pokemon?.id, queryClient])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!pokemon) return
      
      if (e.key === 'ArrowLeft' && pokemon.id > 1) {
        navigate({ to: '/pokemon/$id', params: { id: String(pokemon.id - 1) } })
      } else if (e.key === 'ArrowRight') {
        navigate({ to: '/pokemon/$id', params: { id: String(pokemon.id + 1) } })
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [pokemon, navigate])

  // Copy share link
  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      showToast('Link copied to clipboard!', 'success')
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showToast('Link copied to clipboard!', 'success')
    }
  }

  // Add to team (navigate to form with Pokemon pre-filled)
  const handleAddToTeam = () => {
    if (pokemon) {
      navigate({ to: '/form', search: { pokemon: pokemon.name } })
    }
  }

  const typeColors: Record<string, string> = useMemo(
    () => ({
      normal: 'bg-gray-400',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      electric: 'bg-yellow-400',
      grass: 'bg-green-500',
      ice: 'bg-cyan-300',
      fighting: 'bg-red-700',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-400',
      psychic: 'bg-pink-500',
      bug: 'bg-green-400',
      rock: 'bg-yellow-700',
      ghost: 'bg-purple-700',
      dragon: 'bg-indigo-700',
      dark: 'bg-gray-800',
      steel: 'bg-gray-500',
      fairy: 'bg-pink-300',
    }),
    []
  )

  if (isPending) {
    return (
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          ← Back to Home
        </Link>
        <SkeletonDetail />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-6 max-w-4xl mx-auto" role="alert">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          ← Back to Home
        </Link>
        <div className="text-center py-12 space-y-4">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Error loading Pokemon
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Retry loading Pokemon"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!pokemon) {
    return null
  }

  const currentSprite = showShiny && pokemon.sprites.front_shiny
    ? pokemon.sprites.front_shiny
    : pokemon.sprites.front_default

  const hasShiny = !!pokemon.sprites.front_shiny
  const prevId = pokemon.id > 1 ? String(pokemon.id - 1) : null
  const nextId = String(pokemon.id + 1)

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      {/* Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
          aria-label="Back to home"
        >
          ← Back to Home
        </Link>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Previous/Next Navigation */}
          <div className="flex items-center justify-center gap-2">
            {prevId && (
              <Link
                to="/pokemon/$id"
                params={{ id: prevId }}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm font-medium"
                aria-label={`Previous Pokemon (#${prevId})`}
              >
                ← Prev
              </Link>
            )}
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">
              #{String(pokemon.id).padStart(3, '0')}
            </span>
            <Link
              to="/pokemon/$id"
              params={{ id: nextId }}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm font-medium"
              aria-label={`Next Pokemon (#${nextId})`}
            >
              Next →
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm font-medium"
              aria-label="Share Pokemon link"
            >
              🔗 Share
            </button>
            <button
              onClick={handleAddToTeam}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm font-medium"
              aria-label="Add to team"
            >
              ➕ Add to Team
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Navigation Hint */}
      <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 text-center hidden sm:block">
        💡 Use arrow keys (← →) to navigate between Pokemon
      </div>

      {/* Pokemon Detail Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 md:p-8 transition-shadow hover:shadow-xl">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column - Image and Basic Info */}
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 capitalize mb-2">
                {pokemon.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                #{String(pokemon.id).padStart(3, '0')}
                {showShiny && hasShiny && (
                  <span className="ml-2 text-yellow-500">✨</span>
                )}
              </p>
            </div>

            {/* Pokemon Image */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {currentSprite && !imageError ? (
                  <img
                    src={currentSprite}
                    alt={`${pokemon.name}${showShiny ? ' (Shiny)' : ''}`}
                    className="w-64 h-64 object-contain"
                    loading="lazy"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-6xl">🦎</span>
                  </div>
                )}
                {hasShiny && (
                  <button
                    onClick={() => {
                      setShowShiny(!showShiny)
                      setImageError(false)
                    }}
                    className="absolute bottom-2 right-2 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-semibold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    aria-label={`Switch to ${showShiny ? 'normal' : 'shiny'} sprite`}
                  >
                    ✨ {showShiny ? 'Normal' : 'Shiny'}
                  </button>
                )}
              </div>
              {hasShiny && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {showShiny ? 'Shiny' : 'Normal'} form
                </p>
              )}
            </div>

            {/* Types */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Types</h2>
              <div className="flex flex-wrap gap-2">
                {pokemon.types.map((type) => (
                  <span
                    key={type.type.name}
                    className={`px-4 py-2 rounded-full text-white font-medium capitalize ${
                      typeColors[type.type.name] || 'bg-gray-400'
                    }`}
                  >
                    {type.type.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Stats and Details */}
          <div className="space-y-6">
            {/* Base Stats */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Base Stats
              </h2>
              <div className="space-y-3">
                {pokemon.stats.map((stat) => (
                  <div key={stat.stat.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {stat.stat.name.replace('-', ' ')}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.base_stat}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2" role="presentation">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((stat.base_stat / 255) * 100, 100)}%` }}
                        aria-label={`${stat.stat.name.replace('-', ' ')}: ${stat.base_stat} out of 255`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Physical Attributes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Height</h3>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {(pokemon.height / 10).toFixed(1)} m
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Weight</h3>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {(pokemon.weight / 10).toFixed(1)} kg
                </p>
              </div>
            </div>

            {/* Abilities */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Abilities</h2>
              <div className="space-y-2">
                {pokemon.abilities.map((ability) => (
                  <div
                    key={ability.ability.name}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <span className="capitalize">{ability.ability.name.replace('-', ' ')}</span>
                    {ability.is_hidden && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Base Experience */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Base Experience
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {pokemon.base_experience}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation to Table */}
      <div className="mt-6 text-center">
        <Link
          to="/pokemon-table"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          View all Pokemon in Table →
        </Link>
      </div>

      {/* Toast Notification */}
      {ToastComponent}
    </div>
  )
}

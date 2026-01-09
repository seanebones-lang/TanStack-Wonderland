import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { useState, useMemo, useRef, useEffect } from 'react'
import { rateLimitedFetch } from '../utils/rateLimiter'
import { isValidPokemonName, sanitizeSearchQuery } from '../utils/inputValidation'

const teamSchema = z.object({
  team: z.array(z.string().min(1, 'Pokemon name is required')).min(6, 'You must select at least 6 Pokemon'),
})

type TeamForm = {
  team: string[]
}

const submitTeam = async (team: string[]): Promise<{ success: boolean; message: string }> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log('Submitting team:', team)
  return {
    success: true,
    message: `Team submitted successfully with ${team.length} Pokemon!`,
  }
}

// Search Pokemon for autocomplete
const searchPokemon = async (query: string): Promise<string[]> => {
  if (query.length < 2) return []
  const sanitizedQuery = sanitizeSearchQuery(query)
  const response = await rateLimitedFetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`)
  if (!response.ok) return []
  const data = await response.json()
  return data.results
    .map((p: { name: string }) => p.name)
    .filter((name: string) => {
      // Validate Pokemon name
      if (!isValidPokemonName(name)) return false
      return name.toLowerCase().includes(sanitizedQuery.toLowerCase())
    })
    .slice(0, 10)
}

// Autocomplete Field Component
function PokemonAutocompleteField({
  index,
  form,
  searchQuery,
  onSearchChange,
  isActive,
  onFocus,
  onBlur,
  teamValues,
}: {
  index: number
  form: ReturnType<typeof useForm<TeamForm>>
  searchQuery: string
  onSearchChange: (query: string) => void
  isActive: boolean
  onFocus: () => void
  onBlur: () => void
  teamValues: string[]
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const { data: suggestions = [], isPending: isSearching } = useQuery({
    queryKey: ['pokemon', 'search', searchQuery],
    queryFn: () => searchPokemon(searchQuery),
    enabled: searchQuery.length >= 2 && isActive,
    staleTime: 5 * 60 * 1000,
  })

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(
      (name) =>
        !teamValues.includes(name) || name === form.state.values.team[index]
    )
  }, [suggestions, teamValues, index, form.state.values.team])

  const isDuplicate = useMemo(() => {
    const value = form.state.values.team[index]
    return !!(value && teamValues.filter((p) => p === value).length > 1)
  }, [teamValues, index, form.state.values.team])

  return (
    <form.Field
      name={`team[${index}]` as const}
      validators={{
        onChange: ({ value }) => {
          if (!value || value.length === 0) {
            return 'Pokemon name is required'
          }
          // Check for duplicates
          const duplicates = teamValues.filter((p) => p === value && p !== '')
          if (duplicates.length > 1) {
            return 'This Pokemon is already in your team'
          }
          return undefined
        },
      }}
    >
      {(field) => (
        <div className="relative">
          <label
            htmlFor={`pokemon-${index}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Pokemon {index + 1}
            {isDuplicate && (
              <span className="ml-2 text-red-600 dark:text-red-400 text-xs">
                (Duplicate)
              </span>
            )}
          </label>
          <div className="relative">
            <input
              id={`pokemon-${index}`}
              ref={inputRef}
              value={field.state.value}
              onChange={(e) => {
                const value = e.target.value
                field.handleChange(value)
                onSearchChange(value)
              }}
              onFocus={() => {
                onFocus()
                onSearchChange(field.state.value)
              }}
              onBlur={onBlur}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown' && filteredSuggestions.length > 0) {
                  e.preventDefault()
                  suggestionsRef.current?.querySelector('button')?.focus()
                }
              }}
              placeholder="Type to search Pokemon..."
              aria-label={`Pokemon ${index + 1}`}
              aria-autocomplete="list"
              aria-expanded={isActive && filteredSuggestions.length > 0}
              aria-controls={`suggestions-${index}`}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDuplicate
                  ? 'border-red-500 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {isSearching && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Autocomplete Suggestions */}
          {isActive && filteredSuggestions.length > 0 && searchQuery.length >= 2 && (
            <div
              id={`suggestions-${index}`}
              ref={suggestionsRef}
              role="listbox"
              className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-auto"
            >
              {filteredSuggestions.slice(0, 10).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  role="option"
                  onClick={() => {
                    field.handleChange(suggestion)
                    onSearchChange('')
                    inputRef.current?.blur()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      field.handleChange(suggestion)
                      onSearchChange('')
                      inputRef.current?.blur()
                    }
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none capitalize"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Field Errors */}
          {field.state.meta.errors && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {field.state.meta.errors[0]}
            </p>
          )}
        </div>
      )}
    </form.Field>
  )
}

export const Route = createFileRoute('/form')({
  component: PokemonTeamForm,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      pokemon: (search.pokemon as string) || undefined,
    }
  },
})

function PokemonTeamForm() {
  const queryClient = useQueryClient()
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState<number | null>(null)
  const [searchQueries, setSearchQueries] = useState<Record<number, string>>({})
  const search = Route.useSearch()

  // Initialize form with Pokemon from URL if provided
  const initialTeam = useMemo(() => {
    const team = ['', '', '', '', '', '']
    if (search.pokemon) {
      team[0] = search.pokemon
    }
    return team
  }, [search.pokemon])

  const form = useForm<TeamForm>({
    defaultValues: {
      team: initialTeam,
    },
    validators: {
      onChange: ({ value }) => {
        // Check for duplicates
        const duplicates = value.team.filter(
          (pokemon, index) => pokemon && value.team.indexOf(pokemon) !== index
        )
        if (duplicates.length > 0) {
          return 'Duplicate Pokemon detected. Each Pokemon can only be in your team once.'
        }

        const result = teamSchema.safeParse(value)
        if (!result.success) {
          const firstError = result.error.errors[0]
          return firstError ? firstError.message : 'Validation failed'
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value.team)
    },
  })

  // Optimistic mutation with rollback
  const mutation = useMutation({
    mutationFn: submitTeam,
    onMutate: async (newTeam) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['team'] })
      
      // Snapshot previous value
      const previousTeam = queryClient.getQueryData<string[]>(['team'])
      
      // Optimistically update
      queryClient.setQueryData(['team'], newTeam)
      
      return { previousTeam }
    },
    onSuccess: (data) => {
      setSubmitMessage(data.message)
      // Persist team to localStorage
      const team = form.state.values.team.filter(Boolean)
      localStorage.setItem('savedTeam', JSON.stringify(team))
      form.reset()
      queryClient.invalidateQueries({ queryKey: ['pokemon'] })
    },
    onError: (error, _newTeam, context) => {
      // Rollback on error
      if (context?.previousTeam) {
        queryClient.setQueryData(['team'], context.previousTeam)
      }
      setSubmitMessage(`Error: ${error.message}`)
    },
  })

  // Load saved team on mount (only if no Pokemon from URL)
  useEffect(() => {
    if (search.pokemon) {
      // If Pokemon from URL, focus on the first field
      setActiveAutocompleteIndex(0)
      return
    }

    const saved = localStorage.getItem('savedTeam')
    if (saved) {
      try {
        const team = JSON.parse(saved)
        if (Array.isArray(team) && team.length > 0) {
          const paddedTeam = [...team, ...Array(6 - team.length).fill('')].slice(0, 6)
          form.setFieldValue('team', paddedTeam)
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [search.pokemon, form])

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Pokemon Team Builder
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Build your team of 6 Pokemon
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        {form.state.values.team.map((_, index) => (
          <PokemonAutocompleteField
            key={index}
            index={index}
            form={form}
            searchQuery={searchQueries[index] || ''}
            onSearchChange={(query) => setSearchQueries({ ...searchQueries, [index]: query })}
            isActive={activeAutocompleteIndex === index}
            onFocus={() => setActiveAutocompleteIndex(index)}
            onBlur={() => setTimeout(() => setActiveAutocompleteIndex(null), 200)}
            teamValues={form.state.values.team}
          />
        ))}

        {form.state.errors.length > 0 && (
          <div className="text-red-600 dark:text-red-400 text-sm">
            {form.state.errors[0]}
          </div>
        )}

        {submitMessage && (
          <div
            className={`p-4 rounded-lg ${
              submitMessage.includes('Error')
                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            }`}
          >
            {submitMessage}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={mutation.isPending || !form.state.isValid}
            className="btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Submitting...' : 'Submit Team'}
          </button>
          <button
            type="button"
            onClick={() => {
              form.reset()
              setSubmitMessage(null)
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Save Team Button */}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => {
            const team = form.state.values.team.filter(Boolean)
            localStorage.setItem('savedTeam', JSON.stringify(team))
            setSubmitMessage('Team saved locally!')
            setTimeout(() => setSubmitMessage(null), 3000)
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Save team to local storage"
        >
          💾 Save Team
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Team Preview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {form.state.values.team.map((pokemon, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                pokemon
                  ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-700'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Slot {index + 1}
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                {pokemon || 'Empty'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

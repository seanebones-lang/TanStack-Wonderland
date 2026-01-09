import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useState } from 'react'

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

export const Route = createFileRoute('/form')({
  component: PokemonTeamForm,
})

function PokemonTeamForm() {
  const queryClient = useQueryClient()
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  const form = useForm<TeamForm>({
    defaultValues: {
      team: ['', '', '', '', '', ''],
    },
    validators: {
      onChange: ({ value }) => {
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

  const mutation = useMutation({
    mutationFn: submitTeam,
    onSuccess: (data) => {
      setSubmitMessage(data.message)
      form.reset()
      // Invalidate queries to refetch if needed
      queryClient.invalidateQueries({ queryKey: ['pokemon'] })
    },
    onError: (error) => {
      setSubmitMessage(`Error: ${error.message}`)
    },
  })

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
          <form.Field
            key={index}
            name={`team[${index}]` as const}
            validators={{
              onChange: ({ value }) => {
                if (!value || value.length === 0) {
                  return 'Pokemon name is required'
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pokemon {index + 1}
                </label>
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Enter Pokemon name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {field.state.meta.errors && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>
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

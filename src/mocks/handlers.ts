import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('https://pokeapi.co/api/v2/pokemon', ({ request }) => {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const mockResults = Array.from({ length: limit }, (_, i) => ({
      name: `pokemon-${offset + i + 1}`,
      url: `https://pokeapi.co/api/v2/pokemon/${offset + i + 1}/`,
    }))

    return HttpResponse.json({
      count: 1000,
      next: offset + limit < 1000 ? `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset + limit}` : null,
      previous: offset > 0 ? `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
      results: mockResults,
    })
  }),
]

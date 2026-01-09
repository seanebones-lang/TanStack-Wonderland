import { createFileRoute } from '@tanstack/react-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  type SortingState,
  flexRender,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo, useRef, useState } from 'react'

interface Pokemon {
  name: string
  url: string
}

interface PokemonResponse {
  results: Pokemon[]
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

const columnHelper = createColumnHelper<Pokemon>()

export const Route = createFileRoute('/pokemon-table')({
  component: PokemonTable,
})

function PokemonTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const parentRef = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, isFetchingNextPage, isPending, error } = useInfiniteQuery({
    queryKey: ['pokemon', 'infinite'],
    queryFn: fetchPokemon,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  })

  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data]
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => (
          <span className="capitalize font-medium text-gray-900 dark:text-gray-100">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('url', {
        header: 'URL',
        cell: (info) => (
          <a
            href={info.getValue()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            {info.getValue()}
          </a>
        ),
      }),
    ],
    []
  )

  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  })

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()

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
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Pokemon Table
      </h1>

      <div className="mb-4">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search Pokemon..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div
        ref={parentRef}
        className="h-[500px] overflow-auto border border-gray-300 dark:border-gray-600 rounded-lg"
      >
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600 cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : header.column.getCanSort() ? (
                            <>
                              {header.column.getIsSorted() === 'asc' ? '↑' : header.column.getIsSorted() === 'desc' ? '↓' : '⇅'}
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index]
              return (
                <tr
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div className="mt-4 text-center">
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage || !data?.pages[data.pages.length - 1].next}
          className="btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      </div>
    </div>
  )
}

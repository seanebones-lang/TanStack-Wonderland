import { createFileRoute } from '@tanstack/react-router'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  flexRender,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo, useRef, useState, useEffect } from 'react'
import { rateLimitedFetch } from '../utils/rateLimiter'
import { sanitizeSearchQuery } from '../utils/inputValidation'

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
  const response = await rateLimitedFetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
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

// Export function
const exportToCSV = (data: Pokemon[]) => {
  const headers = ['Name', 'URL']
  const rows = data.map((p) => [p.name, p.url])
  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'pokemon-export.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export const Route = createFileRoute('/pokemon-table')({
  component: PokemonTable,
})

function PokemonTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false)
  const parentRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

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
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            aria-label="Select all rows"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`Select ${row.original.name}`}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      }),
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
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all"
            aria-label={`Open ${info.row.original.name} details`}
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
    enableRowSelection: true,
    enableMultiSort: true,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  })

  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original)

  const handleExport = () => {
    if (selectedRows.length > 0) {
      exportToCSV(selectedRows)
    } else {
      exportToCSV(flatData)
    }
  }

  // Close column menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[aria-expanded]') && isColumnMenuOpen) {
        setIsColumnMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isColumnMenuOpen])

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
      <div className="flex justify-center items-center py-12" role="status" aria-label="Loading Pokemon table">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="text-red-600 dark:text-red-400 text-center py-12">
        <p className="text-lg font-semibold mb-2">Error loading Pokemon: {error.message}</p>
        <button
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['pokemon', 'infinite'] })
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Pokemon Table
      </h1>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => {
              const sanitized = sanitizeSearchQuery(e.target.value)
              setGlobalFilter(sanitized)
            }}
            placeholder="Search Pokemon..."
            aria-label="Search Pokemon"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-2 items-center">
          {selectedRows.length > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedRows.length} selected
            </span>
          )}
          
          {/* Column Visibility Menu */}
          <div className="relative">
            <button
              onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle column visibility"
              aria-expanded={isColumnMenuOpen}
            >
              👁 Columns
            </button>
            {isColumnMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20">
                <div className="p-2">
                  <label className="flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={table.getIsAllColumnsVisible()}
                      onChange={table.getToggleAllColumnsVisibilityHandler()}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-gray-100">Toggle All</span>
                  </label>
                  {table.getAllColumns().filter((col) => col.getCanHide()).map((column) => (
                    <label
                      key={column.id}
                      className="flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">
                        {column.id}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={flatData.length === 0}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Export to CSV"
          >
            📥 Export {selectedRows.length > 0 ? `(${selectedRows.length})` : ''}
          </button>
        </div>
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
                            <button
                              onClick={header.column.getToggleSortingHandler()}
                              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                              aria-label={`Sort by ${header.column.id}`}
                            >
                              {header.column.getIsSorted() === 'asc' ? (
                                <span aria-label="Sorted ascending">↑</span>
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <span aria-label="Sorted descending">↓</span>
                              ) : (
                                <span aria-label="Not sorted">⇅</span>
                              )}
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getIsSorted() && sorting.length > 1 && (
                                <span className="text-xs text-gray-500">
                                  {sorting.findIndex((s) => s.id === header.column.id) + 1}
                                </span>
                              )}
                            </button>
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
            } as React.CSSProperties}
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
                  } as React.CSSProperties}
                  className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    row.getIsSelected() ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
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

      {/* Load More */}
      <div className="mt-4 text-center">
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage || !data?.pages[data.pages.length - 1].next}
          className="btn disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Load more Pokemon"
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      </div>

      {/* Results Count */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        Showing {rows.length} of {flatData.length} Pokemon
        {globalFilter && ` matching "${globalFilter}"`}
      </div>
    </div>
  )
}

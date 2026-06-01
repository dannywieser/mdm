import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useNotesQuery } from './useNotesQuery'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })

  function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return QueryWrapper
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useNotesQuery', () => {
  it('fetches notes without a view filter when no view is provided', async () => {
    const responseBody = {
      notes: [],
      notesDirectory: '/notes',
      obsidianVault: 'vault'
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(responseBody)
    })

    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useNotesQuery(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/notes')
    expect(result.current.data).toEqual(responseBody)
  })

  it('fetches notes with the view filter when a view is provided', async () => {
    const responseBody = {
      notes: [],
      notesDirectory: '/notes',
      obsidianVault: 'vault'
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(responseBody)
    })

    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useNotesQuery('on-this-day'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/notes?view=on-this-day')
  })

  it('returns an error when the response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false
    })

    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useNotesQuery(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Unable to load notes')
  })
})

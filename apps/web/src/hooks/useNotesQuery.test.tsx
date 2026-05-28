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
  it('fetches notes successfully', async () => {
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

    expect(fetchMock).toHaveBeenCalledWith('/api/notes?view=on-this-day')
    expect(result.current.data).toEqual(responseBody)
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

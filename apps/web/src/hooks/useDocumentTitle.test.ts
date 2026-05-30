import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useDocumentTitle } from './useDocumentTitle'

describe('useDocumentTitle', () => {
  it('sets document title to "mdm" when lastCommand is null', () => {
    renderHook(() => useDocumentTitle(null))

    expect(document.title).toBe('mdm')
  })

  it('sets document title to "mdm | otd" when lastCommand is "otd"', () => {
    renderHook(() => useDocumentTitle('otd'))

    expect(document.title).toBe('mdm | otd')
  })

  it('sets document title to "mdm | help" when lastCommand is "help"', () => {
    renderHook(() => useDocumentTitle('help'))

    expect(document.title).toBe('mdm | help')
  })

  it('resets document title to "mdm" when lastCommand changes to null', () => {
    const { rerender } = renderHook(
      ({ cmd }: { cmd: string | null }) => useDocumentTitle(cmd),
      { initialProps: { cmd: 'otd' } },
    )

    expect(document.title).toBe('mdm | otd')

    rerender({ cmd: null })

    expect(document.title).toBe('mdm')
  })

  it('updates document title when lastCommand changes', () => {
    const { rerender } = renderHook(
      ({ cmd }: { cmd: string | null }) => useDocumentTitle(cmd),
      { initialProps: { cmd: 'otd' } },
    )

    expect(document.title).toBe('mdm | otd')

    rerender({ cmd: 'help' })

    expect(document.title).toBe('mdm | help')
  })
})

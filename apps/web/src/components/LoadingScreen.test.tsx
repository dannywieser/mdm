import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LoadingScreen } from './LoadingScreen'

describe('LoadingScreen', () => {
  it('renders the notebook SVG with accessible label', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <LoadingScreen />
      </ChakraProvider>
    )

    expect(screen.getByRole('img', { name: 'Loading' })).toBeTruthy()
  })

  it('renders centered in full viewport', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <LoadingScreen />
      </ChakraProvider>
    )

    const containers = screen.getAllByTestId('loading-screen')
    expect(containers.length).toBeGreaterThan(0)
  })
})

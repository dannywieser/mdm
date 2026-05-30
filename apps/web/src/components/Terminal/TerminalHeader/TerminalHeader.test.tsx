import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TerminalHeader } from './TerminalHeader'

describe('TerminalHeader', () => {
  it('renders the mdm title', () => {
    render(<TerminalHeader />)

    expect(screen.getByText('mdm')).toBeTruthy()
  })

  it('renders a formatted date string', () => {
    render(<TerminalHeader />)

    const dateEl = document.querySelector('.terminal-header-date')
    expect(dateEl).toBeTruthy()
    expect(dateEl!.textContent).toMatch(/\w{3},\s+\d{2}\/\d{2}\/\d{4}/)
  })

  it('renders the header container', () => {
    render(<TerminalHeader />)

    expect(document.querySelector('.terminal-header')).toBeTruthy()
  })
})

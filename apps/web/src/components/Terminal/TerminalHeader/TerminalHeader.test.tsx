import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TerminalHeader } from './TerminalHeader'
import { formatHeaderDate } from './TerminalHeader.util'

describe('TerminalHeader', () => {
  it('renders the mdm title', () => {
    render(<TerminalHeader />)

    expect(screen.getByText('mdm')).toBeTruthy()
  })

  it('renders the header container', () => {
    render(<TerminalHeader />)

    expect(document.querySelector('.terminal-header')).toBeTruthy()
  })

  it('renders a formatted date using the default YYYY.MM.DD (ddd) format', () => {
    render(<TerminalHeader />)

    const dateEl = document.querySelector('.terminal-header-date')
    expect(dateEl).toBeTruthy()
    expect(dateEl!.textContent).toMatch(/^\d{4}\.\d{2}\.\d{2} \(\w{3}\)$/)
  })

  it('renders a formatted date using a custom dateFormat prop', () => {
    render(<TerminalHeader dateFormat="DD/MM/YYYY" />)

    const dateEl = document.querySelector('.terminal-header-date')
    expect(dateEl).toBeTruthy()
    expect(dateEl!.textContent).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })

  describe('formatHeaderDate', () => {
    it('formats a date with the default YYYY.MM.DD (ddd) pattern', () => {
      const date = new Date(2026, 0, 15) // Thu Jan 15 2026
      expect(formatHeaderDate(date, 'YYYY.MM.DD (ddd)')).toBe('2026.01.15 (Thu)')
    })

    it('formats a date with a custom DD/MM/YYYY pattern', () => {
      const date = new Date(2026, 5, 3) // Wed Jun 3 2026
      expect(formatHeaderDate(date, 'DD/MM/YYYY')).toBe('03/06/2026')
    })

    it('formats a date with year, month, and day only', () => {
      const date = new Date(2026, 11, 25) // Fri Dec 25 2026
      expect(formatHeaderDate(date, 'YYYY-MM-DD')).toBe('2026-12-25')
    })
  })
})

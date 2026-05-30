import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TerminalInput } from './TerminalInput'

describe('TerminalInput', () => {
  it('renders the prompt label and input field', () => {
    render(<TerminalInput onSubmit={vi.fn()} />)

    expect(screen.getByRole('textbox', { name: /terminal input/i })).toBeTruthy()
    expect(document.querySelector('.terminal-prompt')).toBeTruthy()
  })

  it('calls onSubmit with the typed value when Enter is pressed', async () => {
    const onSubmit = vi.fn()
    render(<TerminalInput onSubmit={onSubmit} />)

    const input = screen.getByRole('textbox', { name: /terminal input/i })
    await userEvent.type(input, 'otd{enter}')

    expect(onSubmit).toHaveBeenCalledWith('otd')
  })

  it('clears the input after submitting', async () => {
    render(<TerminalInput onSubmit={vi.fn()} />)

    const input = screen.getByRole('textbox', { name: /terminal input/i })
    await userEvent.type(input, 'help{enter}')

    expect((input as HTMLInputElement).value).toBe('')
  })

  it('navigates command history with ArrowUp and ArrowDown', async () => {
    render(<TerminalInput onSubmit={vi.fn()} />)

    const input = screen.getByRole('textbox', { name: /terminal input/i })

    await userEvent.type(input, 'first{enter}')
    await userEvent.type(input, 'second{enter}')

    await userEvent.keyboard('{ArrowUp}')
    expect((input as HTMLInputElement).value).toBe('second')

    await userEvent.keyboard('{ArrowUp}')
    expect((input as HTMLInputElement).value).toBe('first')

    await userEvent.keyboard('{ArrowDown}')
    expect((input as HTMLInputElement).value).toBe('second')
  })

  it('restores empty value when ArrowDown goes past the start of history', async () => {
    render(<TerminalInput onSubmit={vi.fn()} />)

    const input = screen.getByRole('textbox', { name: /terminal input/i })

    await userEvent.type(input, 'cmd{enter}')
    await userEvent.keyboard('{ArrowUp}')
    await userEvent.keyboard('{ArrowDown}')

    expect((input as HTMLInputElement).value).toBe('')
  })
})

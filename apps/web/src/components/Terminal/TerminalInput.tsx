import { useState } from 'react'

interface TerminalInputProps {
  onSubmit: (command: string) => void
}

export const TerminalInput = ({ onSubmit }: TerminalInputProps) => {
  const [value, setValue] = useState('')
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = value.trim()
      if (trimmed) {
        setCmdHistory((prev) => [trimmed, ...prev])
      }
      onSubmit(value)
      setValue('')
      setHistoryIndex(-1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(historyIndex + 1, cmdHistory.length - 1)
      setHistoryIndex(next)
      if (next >= 0) setValue(cmdHistory[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(historyIndex - 1, -1)
      setHistoryIndex(next)
      setValue(next >= 0 ? cmdHistory[next] : '')
    }
  }

  return (
    <div className="terminal-input-area">
      <span className="terminal-prompt" aria-hidden="true">
        mdm &gt;
      </span>
      <input
        className="terminal-input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        aria-label="Terminal input"
        placeholder="type a command…"
      />
    </div>
  )
}

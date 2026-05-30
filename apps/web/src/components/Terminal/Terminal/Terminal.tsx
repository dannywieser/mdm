import { useCallback, useEffect, useRef, useState } from 'react'
import type { Note } from 'markdown'

import { useNotesQuery } from '../../../hooks/useNotesQuery'
import { MiniMap } from '../MiniMap/MiniMap'
import { TerminalHeader } from '../TerminalHeader/TerminalHeader'
import { TerminalInput } from '../TerminalInput/TerminalInput'
import { TerminalOutput } from '../TerminalOutput/TerminalOutput'
import type { HistoryEntry } from '../types'

let entryCounter = 0
const nextId = () => `entry-${++entryCounter}`

export const Terminal = () => {
  const { data, error, isLoading } = useNotesQuery()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [currentNotes, setCurrentNotes] = useState<Note[]>([])
  const hasAutoRun = useRef(false)
  const outputRef = useRef<HTMLDivElement>(null)

  const executeCommand = useCallback(
    (cmd: string, bootstrapNotes?: Note[]) => {
      const trimmed = cmd.trim().toLowerCase()

      if (trimmed === 'clear') {
        setHistory([])
        setCurrentNotes([])
        return
      }

      const commandEntry: HistoryEntry = {
        id: nextId(),
        type: 'command',
        command: trimmed || 'otd',
      }

      if (trimmed === '' || trimmed === 'otd') {
        const notes = bootstrapNotes ?? data?.notes ?? []
        setHistory((prev) => [
          ...prev,
          commandEntry,
          { id: nextId(), type: 'otd', notes },
        ])
        setCurrentNotes(notes)
      } else if (trimmed === 'help') {
        setHistory((prev) => [...prev, commandEntry, { id: nextId(), type: 'help' }])
      } else {
        setHistory((prev) => [
          ...prev,
          commandEntry,
          { id: nextId(), type: 'error', errorMessage: `command not found: ${trimmed}` },
        ])
      }
    },
    [data],
  )

  // Auto-run 'otd' once data is available
  useEffect(() => {
    if (data && !hasAutoRun.current) {
      hasAutoRun.current = true
      const notes = data.notes
      setHistory([
        { id: nextId(), type: 'command', command: 'otd' },
        { id: nextId(), type: 'otd', notes },
      ])
      setCurrentNotes(notes)
    }
  }, [data])

  // Auto-scroll output to bottom when history grows
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [history])

  const scrollToNote = useCallback((noteId: string) => {
    const el = outputRef.current?.querySelector(`[data-note-id="${noteId}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className="terminal">
      <TerminalHeader />
      <div className="terminal-body">
        <TerminalOutput
          ref={outputRef}
          history={history}
          isLoading={isLoading}
          error={error}
        />
        {currentNotes.length > 0 && (
          <MiniMap notes={currentNotes} onSelect={scrollToNote} />
        )}
      </div>
      <TerminalInput onSubmit={executeCommand} />
    </div>
  )
}

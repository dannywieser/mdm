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

const ARROW_SCROLL = 40
const ESTIMATED_LINE_HEIGHT = 18

interface ScrollInfo {
  firstLine: number
  lastLine: number
  totalLines: number
  percent: number
}

const computeScrollInfo = (el: HTMLDivElement): ScrollInfo => {
  const { scrollTop, scrollHeight, clientHeight } = el
  const scrollable = scrollHeight - clientHeight
  const firstLine = Math.floor(scrollTop / ESTIMATED_LINE_HEIGHT) + 1
  const lastLine = Math.ceil((scrollTop + clientHeight) / ESTIMATED_LINE_HEIGHT)
  const totalLines = Math.ceil(scrollHeight / ESTIMATED_LINE_HEIGHT)
  const percent = scrollable <= 0 ? 100 : Math.round((scrollTop / scrollable) * 100)
  return { firstLine, lastLine, totalLines, percent }
}

const formatScrollStatus = (info: ScrollInfo): string => {
  if (info.percent >= 100) return '(END)'
  return `lines ${info.firstLine}–${info.lastLine} / ${info.totalLines} (${info.percent}%)`
}

export const Terminal = () => {
  const { data, error, isLoading } = useNotesQuery()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [currentNotes, setCurrentNotes] = useState<Note[]>([])
  const [scrollInfo, setScrollInfo] = useState<ScrollInfo>({
    firstLine: 1,
    lastLine: 0,
    totalLines: 0,
    percent: 100,
  })
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

  // Scroll behaviour: for otd entries scroll to the command echo at the start;
  // for all other entry types scroll to bottom to show latest output.
  useEffect(() => {
    const output = outputRef.current
    if (!output || history.length === 0) return

    const lastEntry = history[history.length - 1]

    if (lastEntry.type === 'otd') {
      // Scroll to the command echo that immediately precedes the otd section
      const commandEntry = history[history.length - 2]
      if (commandEntry) {
        const el = output.querySelector(`[data-entry-id="${commandEntry.id}"]`)
        if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'start' })
          return
        }
      }
      output.scrollTop = 0
    } else {
      output.scrollTop = output.scrollHeight
    }
  }, [history])

  // Arrow/Page key navigation when input is not focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const output = outputRef.current
      if (!output) return
      const tag = (document.activeElement?.tagName ?? '').toLowerCase()
      if (tag === 'input' || tag === 'textarea') return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          output.scrollTop += ARROW_SCROLL
          break
        case 'ArrowUp':
          e.preventDefault()
          output.scrollTop -= ARROW_SCROLL
          break
        case 'PageDown':
          e.preventDefault()
          output.scrollTop += output.clientHeight
          break
        case 'PageUp':
          e.preventDefault()
          output.scrollTop -= output.clientHeight
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleOutputScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollInfo(computeScrollInfo(e.currentTarget))
  }, [])

  const scrollToNote = useCallback((noteId: string) => {
    const el = outputRef.current?.querySelector(`[data-note-id="${noteId}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className="terminal">
      <TerminalHeader dateFormat={data?.headerDateFormat} />
      <div className="terminal-body">
        <TerminalOutput
          ref={outputRef}
          history={history}
          isLoading={isLoading}
          error={error}
          onScroll={handleOutputScroll}
        />
        {currentNotes.length > 0 && (
          <MiniMap notes={currentNotes} onSelect={scrollToNote} />
        )}
      </div>
      {!isLoading && (
        <div className="terminal-status-bar">{formatScrollStatus(scrollInfo)}</div>
      )}
      <TerminalInput onSubmit={executeCommand} />
    </div>
  )
}

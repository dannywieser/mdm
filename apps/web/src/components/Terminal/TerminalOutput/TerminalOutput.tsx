import { forwardRef } from 'react'

import { TerminalNoteBlock } from '../TerminalNoteBlock/TerminalNoteBlock'
import type { TerminalOutputProps } from './TerminalOutput.types'

const SECTION_DIVIDER =
  '── on-this-day ──────────────────────────────────────────'

const HELP_COMMANDS = [
  { cmd: 'otd', desc: "show today's notes" },
  { cmd: 'clear', desc: 'clear the terminal' },
  { cmd: 'help', desc: 'list available commands' },
]

export const TerminalOutput = forwardRef<HTMLDivElement, TerminalOutputProps>(
  ({ history, isLoading, error }, ref) => (
    <div className="terminal-output" ref={ref}>
      {isLoading && (
        <div className="terminal-line-loading">
          <span className="terminal-prompt-dim" aria-hidden="true">
            mdm &gt;
          </span>
          <span className="terminal-blink">connecting…</span>
        </div>
      )}

      {error && (
        <div className="terminal-line terminal-line-error">
          error: {error.message}
        </div>
      )}

      {history.map((entry) => {
        if (entry.type === 'command') {
          return (
            <div key={entry.id} className="terminal-command-echo">
              <span className="terminal-prompt" aria-hidden="true">
                mdm &gt;
              </span>
              <span>{entry.command}</span>
            </div>
          )
        }

        if (entry.type === 'otd') {
          return (
            <div key={entry.id} className="terminal-section">
              <div className="terminal-section-divider">{SECTION_DIVIDER}</div>
              {entry.notes.length === 0 ? (
                <div className="terminal-line terminal-line-muted">
                  no notes found for today
                </div>
              ) : (
                entry.notes.map((note) => (
                  <TerminalNoteBlock key={note.id} note={note} />
                ))
              )}
            </div>
          )
        }

        if (entry.type === 'help') {
          return (
            <div key={entry.id} className="terminal-section terminal-help">
              {HELP_COMMANDS.map(({ cmd, desc }) => (
                <div key={cmd} className="terminal-help-row">
                  <span className="terminal-help-cmd">{cmd}</span>
                  <span className="terminal-help-desc">{desc}</span>
                </div>
              ))}
            </div>
          )
        }

        if (entry.type === 'error') {
          return (
            <div key={entry.id} className="terminal-line terminal-line-error">
              {entry.errorMessage}
            </div>
          )
        }

        return null
      })}
    </div>
  ),
)

TerminalOutput.displayName = 'TerminalOutput'

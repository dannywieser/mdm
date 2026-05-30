import { forwardRef } from 'react'

import { useI18n } from '../../../i18n'
import { TerminalNoteBlock } from '../TerminalNoteBlock/TerminalNoteBlock'
import type { TerminalOutputProps } from './TerminalOutput.types'

export const TerminalOutput = forwardRef<HTMLDivElement, TerminalOutputProps>(
  function TerminalOutput({ history, isLoading, error, onScroll }, ref) {
    const { t } = useI18n()

    const HELP_COMMANDS = [
      { cmd: 'otd', desc: t('terminal.help.otd') },
      { cmd: 'clear', desc: t('terminal.help.clear') },
      { cmd: 'help', desc: t('terminal.help.help') },
    ]

    const SECTION_DIVIDER =
      '── on-this-day ──────────────────────────────────────────'

    return (
      <div className="terminal-output" ref={ref} onScroll={onScroll}>
        {isLoading && (
          <div className="terminal-loader">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="notebook-loader"
              aria-label={t('terminal.connecting')}
              role="img"
            >
              <rect className="path-rect" width="16" height="20" x="4" y="2" rx="2" />
              <path className="path-vline" d="M16 2v20" />
              <path className="path-hline1" d="M2 6h4" />
              <path className="path-hline2" d="M2 10h4" />
              <path className="path-hline3" d="M2 14h4" />
              <path className="path-hline4" d="M2 18h4" />
            </svg>
          </div>
        )}

        {error && (
          <div className="terminal-line terminal-line-error">
            {t('terminal.errorMessage', { message: error.message })}
          </div>
        )}

        {history.map((entry) => {
          if (entry.type === 'command') {
            return (
              <div key={entry.id} data-entry-id={entry.id} className="terminal-command-echo">
                <span className="terminal-prompt" aria-hidden="true">
                  mdm &gt;
                </span>
                <span>{entry.command}</span>
              </div>
            )
          }

          if (entry.type === 'otd') {
            return (
              <div key={entry.id} data-entry-id={entry.id} className="terminal-section">
                <div className="terminal-section-divider">{SECTION_DIVIDER}</div>
                {entry.notes.length === 0 ? (
                  <div className="terminal-line terminal-line-muted">
                    {t('terminal.noNotesToday')}
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
              <div key={entry.id} data-entry-id={entry.id} className="terminal-section terminal-help">
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
              <div key={entry.id} data-entry-id={entry.id} className="terminal-line terminal-line-error">
                {entry.errorMessage}
              </div>
            )
          }

          return null
        })}
      </div>
    )
  },
)

TerminalOutput.displayName = 'TerminalOutput'

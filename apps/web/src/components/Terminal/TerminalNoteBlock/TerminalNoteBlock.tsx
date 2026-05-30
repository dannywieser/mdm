import DOMPurify from 'dompurify'
import { useState } from 'react'

import { SANITIZE_CONFIG, type TerminalNoteBlockProps } from './TerminalNoteBlock.types'

export const TerminalNoteBlock = ({ note }: TerminalNoteBlockProps) => {
  const [linkedExpanded, setLinkedExpanded] = useState(false)
  const sanitizedHtml = DOMPurify.sanitize(note.html, SANITIZE_CONFIG)
  const hasLinked = note.linkedNotes && note.linkedNotes.length > 0

  return (
    <div className="terminal-note" data-note-id={note.id}>
      <div className="terminal-note-header">
        <span className="terminal-note-title">{note.title}</span>
        <span className="terminal-note-meta">
          {note.createdDate}
          {note.folder ? ` · ${note.folder}` : ''}
        </span>
      </div>
      <div
        className="terminal-note-content"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
      {hasLinked && (
        <div className="terminal-note-linked">
          <div
            className="terminal-note-linked-header"
            onClick={() => setLinkedExpanded((v) => !v)}
            role="button"
            tabIndex={0}
            aria-expanded={linkedExpanded}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setLinkedExpanded((v) => !v)
            }}
          >
            {linkedExpanded ? '▾' : '▸'} linked notes ({note.linkedNotes!.length})
          </div>
          {linkedExpanded &&
            note.linkedNotes!.map((linked) => (
              <div key={linked.id} className="terminal-note-linked-item">
                <div className="terminal-note-linked-title">{linked.title}</div>
                <div
                  className="terminal-note-content terminal-note-content--linked"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(linked.html, SANITIZE_CONFIG),
                  }}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

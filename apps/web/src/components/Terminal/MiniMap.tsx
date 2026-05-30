import type { Note } from 'markdown'

interface MiniMapProps {
  notes: Note[]
  onSelect: (noteId: string) => void
}

export const MiniMap = ({ notes, onSelect }: MiniMapProps) => (
  <aside className="terminal-minimap" aria-label="Note navigation">
    <div className="terminal-minimap-header">── notes</div>
    <div className="terminal-minimap-list">
      {notes.map((note, index) => (
        <button
          key={note.id}
          className="terminal-minimap-item"
          onClick={() => onSelect(note.id)}
          title={note.title}
          type="button"
        >
          <span className="terminal-minimap-index">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="terminal-minimap-title">{note.title}</span>
        </button>
      ))}
    </div>
  </aside>
)

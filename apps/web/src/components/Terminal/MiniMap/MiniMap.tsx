import { useI18n } from '../../../i18n'
import type { MiniMapProps } from './MiniMap.types'

export const MiniMap = ({ isOpen, notes, onClose, onSelect }: MiniMapProps) => {
  const { t } = useI18n()
  const className = ['terminal-minimap', isOpen ? 'terminal-minimap--open' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <aside className={className} aria-label="Note navigation">
      <div className="terminal-minimap-header">
        <span>── notes</span>
        {onClose && (
          <button
            aria-label={t('terminal.minimap.close')}
            className="terminal-minimap-close"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        )}
      </div>
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
}

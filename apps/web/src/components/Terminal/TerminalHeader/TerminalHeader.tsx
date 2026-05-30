import { useI18n } from '../../../i18n'
import { formatHeaderDate } from './TerminalHeader.util'
import type { TerminalHeaderProps } from './TerminalHeader.types'

const DEFAULT_DATE_FORMAT = 'YYYY.MM.DD (ddd)'

export const TerminalHeader = ({
  dateFormat = DEFAULT_DATE_FORMAT,
  miniMapOpen,
  onToggleMiniMap,
}: TerminalHeaderProps = {}) => {
  const { t } = useI18n()
  const dateStr = formatHeaderDate(new Date(), dateFormat)
  const toggleLabel = miniMapOpen ? t('terminal.minimap.close') : t('terminal.minimap.open')

  return (
    <div className="terminal-header">
      <span className="terminal-header-title">mdm</span>
      <div className="terminal-header-right">
        <span className="terminal-header-date">{dateStr}</span>
        {onToggleMiniMap && (
          <button
            aria-label={toggleLabel}
            className="terminal-header-map-toggle"
            onClick={onToggleMiniMap}
            type="button"
          >
            {miniMapOpen ? '✕' : '≡'}
          </button>
        )}
      </div>
    </div>
  )
}

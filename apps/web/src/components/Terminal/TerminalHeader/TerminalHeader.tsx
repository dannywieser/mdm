import { formatHeaderDate } from './TerminalHeader.util'
import type { TerminalHeaderProps } from './TerminalHeader.types'

const DEFAULT_DATE_FORMAT = 'YYYY.MM.DD (ddd)'

export const TerminalHeader = ({ dateFormat = DEFAULT_DATE_FORMAT }: TerminalHeaderProps = {}) => {
  const dateStr = formatHeaderDate(new Date(), dateFormat)

  return (
    <div className="terminal-header">
      <span className="terminal-header-title">mdm</span>
      <span className="terminal-header-date">{dateStr}</span>
    </div>
  )
}

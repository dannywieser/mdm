export const TerminalHeader = () => {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return (
    <div className="terminal-header">
      <span className="terminal-header-title">mdm</span>
      <span className="terminal-header-date">{dateStr}</span>
    </div>
  )
}

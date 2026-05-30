import type { HistoryEntry } from '../types'

export interface TerminalOutputProps {
  history: HistoryEntry[]
  isLoading: boolean
  error: Error | null
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
}

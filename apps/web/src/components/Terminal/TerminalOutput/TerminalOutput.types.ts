import type { HistoryEntry } from '../types'

export interface TerminalOutputProps {
  history: HistoryEntry[]
  isLoading: boolean
  error: Error | null
}

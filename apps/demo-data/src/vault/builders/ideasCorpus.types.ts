export interface IdeaCorpusEntry {
  title: string
  pitch: string
  openQuestions: readonly string[]
  tags: readonly string[]
  archived?: boolean
}

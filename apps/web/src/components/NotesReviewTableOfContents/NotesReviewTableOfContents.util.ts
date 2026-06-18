export const getNoteColor = (isCurrentIndex: boolean, isRead: boolean): string => {
  if (isCurrentIndex) return "app.accent"
  if (isRead) return "app.textMuted"
  return "app.text"
}

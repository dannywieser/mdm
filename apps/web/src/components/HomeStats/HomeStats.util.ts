export interface AttachmentBreakdownEntry {
  count: number
  extension: string
}

export const buildAttachmentBreakdown = (
  totalAttachments: Record<string, number>,
): AttachmentBreakdownEntry[] =>
  Object.entries(totalAttachments)
    .map(([extension, count]) => ({ count, extension }))
    .sort((a, b) => b.count - a.count)

const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const formatHeaderDate = (date: Date, format: string): string => {
  const yyyy = String(date.getFullYear())
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const ddd = SHORT_WEEKDAYS[date.getDay()]
  return format
    .replaceAll('YYYY', yyyy)
    .replaceAll('MM', mm)
    .replaceAll('DD', dd)
    .replaceAll('ddd', ddd)
}


const TimeAgo = (date) => {
  const t = new Date(date).getTime()
  if (Number.isNaN(t)) return '' // guards against malformed dates in dummy data
  const seconds = Math.max(0, Math.floor((Date.now() - t) / 1000))
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [name, size] of units) {
    const value = Math.floor(seconds / size)
    if (value >= 1) return `${value} ${name}${value > 1 ? 's' : ''} ago`
  }
  return 'just now'
}
export default TimeAgo
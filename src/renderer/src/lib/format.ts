/** Short, human-friendly relative-ish timestamp in pt-BR. */
export function formatWhen(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `há ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `há ${days}d`
  return date.toLocaleDateString('pt-BR')
}

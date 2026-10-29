export function fmtTime(ms = 0) {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// Choisit l'image la plus petite qui fait au moins `min` px, sinon la plus grande
export function bestImage(images = [], min = 300) {
  if (!images || !images.length) return ''
  const sorted = [...images].sort((a, b) => (a.width || 0) - (b.width || 0))
  return (sorted.find(i => (i.width || 0) >= min) || sorted[sorted.length - 1]).url
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function dedupe(list, key = 'id') {
  const seen = new Set()
  return list.filter(x => x && !seen.has(x[key]) && seen.add(x[key]))
}

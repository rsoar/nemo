/**
 * Placeholder category presets matching the design. These drive the filter
 * pills and the editor's category chip visually; actual persistence/assignment
 * (backed by the `categories` table) arrives in Phase 4.
 */
export interface CategoryPreset {
  key: string
  label: string
  colorVar: string
}

export const CATEGORIES: CategoryPreset[] = [
  { key: 'work', label: 'Work', colorVar: 'var(--cat-work)' },
  { key: 'personal', label: 'Personal', colorVar: 'var(--cat-personal)' },
  { key: 'study', label: 'Study', colorVar: 'var(--cat-study)' },
  { key: 'ideas', label: 'Ideas', colorVar: 'var(--cat-ideas)' },
  { key: 'product', label: 'Product', colorVar: 'var(--cat-product)' }
]

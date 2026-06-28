import { getDb } from './connection'
import type { Category } from '../../shared/types'

function list(): Category[] {
  return getDb()
    .prepare('SELECT id, name, color FROM categories ORDER BY id')
    .all() as Category[]
}

function create(name: string, color: string | null): Category {
  const info = getDb()
    .prepare('INSERT INTO categories (name, color) VALUES (?, ?)')
    .run(name, color)
  return getDb()
    .prepare('SELECT id, name, color FROM categories WHERE id = ?')
    .get(Number(info.lastInsertRowid)) as Category
}

function remove(id: number): void {
  // notes.category_id is ON DELETE SET NULL, so affected notes are un-categorized.
  getDb().prepare('DELETE FROM categories WHERE id = ?').run(id)
}

export const categoryRepository = { list, create, remove }

import { getDb } from './connection'
import type { Category } from '../../shared/types'

function list(): Category[] {
  return getDb()
    .prepare('SELECT id, name, color FROM categories ORDER BY id')
    .all() as Category[]
}

export const categoryRepository = { list }

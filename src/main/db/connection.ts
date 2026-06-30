import { join } from 'path'
import { existsSync, copyFileSync, mkdirSync } from 'fs'
import { app } from 'electron'
import Database from 'better-sqlite3'
import { SCHEMA } from './schema'

let db: Database.Database | null = null

/**
 * One-time migration from the former "memo" identity: if the new nemo database
 * doesn't exist yet but a legacy ~/.config/memo/memo.db does, copy it over
 * (including its WAL/SHM sidecars) so existing notes carry over.
 */
function migrateLegacyDatabase(targetFile: string): void {
  if (existsSync(targetFile)) return
  const legacy = join(app.getPath('appData'), 'memo', 'memo.db')
  if (!existsSync(legacy)) return
  mkdirSync(join(targetFile, '..'), { recursive: true })
  for (const suffix of ['', '-wal', '-shm']) {
    if (existsSync(legacy + suffix)) copyFileSync(legacy + suffix, targetFile + suffix)
  }
}

/** Default categories seeded on first run (oklch colors match the theme tokens). */
const PRESET_CATEGORIES: Array<{ name: string; color: string }> = [
  { name: 'Work', color: 'oklch(0.75 0.14 245)' },
  { name: 'Personal', color: 'oklch(0.80 0.15 75)' },
  { name: 'Study', color: 'oklch(0.78 0.16 155)' },
  { name: 'Ideas', color: 'oklch(0.72 0.18 15)' },
  { name: 'Product', color: 'oklch(0.74 0.16 295)' }
]

function seedCategories(database: Database.Database): void {
  const { n } = database.prepare('SELECT COUNT(*) AS n FROM categories').get() as { n: number }
  if (n > 0) return
  const insert = database.prepare('INSERT INTO categories (name, color) VALUES (?, ?)')
  database.transaction(() => {
    for (const c of PRESET_CATEGORIES) insert.run(c.name, c.color)
  })()
}

/**
 * Lazily opens (and initializes) the SQLite database stored in the per-user
 * app data directory. All repositories go through this single connection.
 */
export function getDb(): Database.Database {
  if (!db) {
    const file = join(app.getPath('userData'), 'nemo.db')
    migrateLegacyDatabase(file)
    db = new Database(file)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    db.exec(SCHEMA)
    seedCategories(db)
  }
  return db
}

export function closeDb(): void {
  db?.close()
  db = null
}

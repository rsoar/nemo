import { join } from 'path'
import { app } from 'electron'
import Database from 'better-sqlite3'
import { SCHEMA } from './schema'

let db: Database.Database | null = null

/**
 * Lazily opens (and initializes) the SQLite database stored in the per-user
 * app data directory. All repositories go through this single connection.
 */
export function getDb(): Database.Database {
  if (!db) {
    const file = join(app.getPath('userData'), 'memo.db')
    db = new Database(file)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    db.exec(SCHEMA)
  }
  return db
}

export function closeDb(): void {
  db?.close()
  db = null
}

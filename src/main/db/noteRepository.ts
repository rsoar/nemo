import { getDb } from './connection'
import type { Note, NoteInput, Tag } from '../../shared/types'

interface NoteRow {
  id: number
  title: string
  body_json: string | null
  body_md: string | null
  category_id: number | null
  created_at: string
  updated_at: string
}

function tagsForNote(noteId: number): Tag[] {
  return getDb()
    .prepare(
      `SELECT t.id, t.name FROM tags t
         JOIN note_tags nt ON nt.tag_id = t.id
        WHERE nt.note_id = ?
        ORDER BY t.name`
    )
    .all(noteId) as Tag[]
}

function mapNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    bodyJson: row.body_json,
    bodyMd: row.body_md,
    categoryId: row.category_id,
    tags: tagsForNote(row.id),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function get(id: number): Note | null {
  const row = getDb().prepare('SELECT * FROM notes WHERE id = ?').get(id) as
    | NoteRow
    | undefined
  return row ? mapNote(row) : null
}

function list(): Note[] {
  const rows = getDb()
    .prepare('SELECT * FROM notes ORDER BY updated_at DESC')
    .all() as NoteRow[]
  return rows.map(mapNote)
}

function create(input: NoteInput): Note {
  const now = new Date().toISOString()
  const info = getDb()
    .prepare(
      `INSERT INTO notes (title, body_json, body_md, category_id, created_at, updated_at)
       VALUES (@title, @bodyJson, @bodyMd, @categoryId, @createdAt, @updatedAt)`
    )
    .run({
      title: input.title ?? '',
      bodyJson: input.bodyJson ?? null,
      bodyMd: input.bodyMd ?? null,
      categoryId: input.categoryId ?? null,
      createdAt: now,
      updatedAt: now
    })
  return get(Number(info.lastInsertRowid))!
}

function update(id: number, input: NoteInput): Note {
  getDb()
    .prepare(
      `UPDATE notes
          SET title = @title,
              body_json = @bodyJson,
              body_md = @bodyMd,
              category_id = @categoryId,
              updated_at = @updatedAt
        WHERE id = @id`
    )
    .run({
      id,
      title: input.title ?? '',
      bodyJson: input.bodyJson ?? null,
      bodyMd: input.bodyMd ?? null,
      categoryId: input.categoryId ?? null,
      updatedAt: new Date().toISOString()
    })
  return get(id)!
}

function remove(id: number): void {
  getDb().prepare('DELETE FROM notes WHERE id = ?').run(id)
}

export const noteRepository = { list, get, create, update, remove }

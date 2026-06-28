import { useMemo, useState } from 'react'
import type { Note } from '@shared/types'
import { formatWhen } from '../lib/format'

interface Props {
  notes: Note[]
  onNew: () => void
  onOpen: (id: number) => void
}

export default function NoteList({ notes, onNew, onOpen }: Props): JSX.Element {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notes
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.bodyMd ?? '').toLowerCase().includes(q)
    )
  }, [notes, query])

  return (
    <>
      <div className="actionbar">
        <input
          className="search"
          type="search"
          placeholder="Buscar…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn--primary" onClick={onNew}>
          + Nova
        </button>
      </div>

      <main className="panel">
        {filtered.length === 0 ? (
          <p className="empty">
            {notes.length === 0
              ? 'Nenhuma anotação ainda. Crie a primeira em "+ Nova".'
              : 'Nada encontrado para a busca.'}
          </p>
        ) : (
          <ul className="notelist">
            {filtered.map((note) => (
              <li key={note.id}>
                <button className="noteitem" onClick={() => onOpen(note.id)}>
                  <span className="noteitem__title">
                    {note.title || '(sem título)'}
                  </span>
                  {note.bodyMd && (
                    <span className="noteitem__preview">{note.bodyMd}</span>
                  )}
                  <span className="noteitem__when">{formatWhen(note.updatedAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}

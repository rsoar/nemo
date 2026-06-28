import { useEffect, useState } from 'react'

interface Props {
  /** Note id to edit, or null to create a new note. */
  id: number | null
  onClose: () => void
}

export default function NoteEditor({ id, onClose }: Props): JSX.Element {
  const [noteId, setNoteId] = useState<number | null>(id)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(id !== null)

  useEffect(() => {
    let active = true
    if (id === null) {
      setLoading(false)
      return
    }
    window.api.notes.get(id).then((note) => {
      if (!active || !note) return
      setTitle(note.title)
      setBody(note.bodyMd ?? '')
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [id])

  async function save(): Promise<void> {
    const input = { title: title.trim(), bodyMd: body }
    if (noteId === null) {
      const created = await window.api.notes.create(input)
      setNoteId(created.id)
    } else {
      await window.api.notes.update(noteId, input)
    }
  }

  async function saveAndClose(): Promise<void> {
    // Skip persisting a brand-new, completely empty note.
    if (!(noteId === null && !title.trim() && !body.trim())) {
      await save()
    }
    onClose()
  }

  async function remove(): Promise<void> {
    if (noteId !== null) {
      await window.api.notes.remove(noteId)
    }
    onClose()
  }

  if (loading) {
    return (
      <main className="panel">
        <p className="empty">Carregando…</p>
      </main>
    )
  }

  return (
    <>
      <div className="actionbar">
        <button className="btn" onClick={saveAndClose} title="Voltar e salvar">
          ← Voltar
        </button>
        <div className="actionbar__spacer" />
        <button className="btn" onClick={save} title="Salvar">
          Salvar
        </button>
        <button
          className="btn btn--danger"
          onClick={remove}
          title="Excluir nota"
        >
          Excluir
        </button>
      </div>

      <main className="panel editor">
        <input
          className="editor__title"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="editor__body"
          placeholder="Escreva sua anotação… (editor rico chega na Fase 3)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </main>
    </>
  )
}

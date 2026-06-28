import { useEffect, useRef, useState } from 'react'

interface Props {
  /** Note id to edit, or null to create a new note. */
  id: number | null
  onClose: () => void
}

type SaveStatus = '' | 'saving' | 'saved'

const AUTOSAVE_DELAY = 600

export default function NoteEditor({ id, onClose }: Props): JSX.Element {
  const [noteId, setNoteId] = useState<number | null>(id)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(id !== null)
  const [status, setStatus] = useState<SaveStatus>('')

  // Last persisted snapshot (to detect "dirty") and the latest edited values
  // (so debounced/flush saves always use current content).
  const saved = useRef({ title: '', body: '' })
  const latest = useRef({ title: '', body: '', noteId: id })
  latest.current = { title, body, noteId }

  // Serialize writes so a debounced save and a flush-on-close never race into
  // two INSERTs for the same new note.
  const chain = useRef<Promise<void>>(Promise.resolve())
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    let active = true
    if (id === null) {
      saved.current = { title: '', body: '' }
      setLoading(false)
      return
    }
    window.api.notes.get(id).then((note) => {
      if (!active || !note) return
      setTitle(note.title)
      setBody(note.bodyMd ?? '')
      saved.current = { title: note.title, body: note.bodyMd ?? '' }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [id])

  function persist(): Promise<void> {
    chain.current = chain.current.then(async () => {
      const { title: t, body: b, noteId: nid } = latest.current
      const trimmed = t.trim()
      const isEmptyNew = nid === null && !trimmed && !b.trim()
      const isClean = trimmed === saved.current.title && b === saved.current.body
      if (isEmptyNew || isClean) {
        setStatus('saved')
        return
      }
      const input = { title: trimmed, bodyMd: b }
      if (nid === null) {
        const created = await window.api.notes.create(input)
        setNoteId(created.id)
        latest.current.noteId = created.id
      } else {
        await window.api.notes.update(nid, input)
      }
      saved.current = { title: trimmed, body: b }
      setStatus('saved')
    })
    return chain.current
  }

  function edit(next: { title?: string; body?: string }): void {
    if (next.title !== undefined) setTitle(next.title)
    if (next.body !== undefined) setBody(next.body)
    setStatus('saving')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => void persist(), AUTOSAVE_DELAY)
  }

  async function handleBack(): Promise<void> {
    if (timer.current) clearTimeout(timer.current)
    await persist() // flush any pending edit before leaving
    onClose()
  }

  async function handleDelete(): Promise<void> {
    if (timer.current) clearTimeout(timer.current)
    const nid = latest.current.noteId
    if (nid !== null) await window.api.notes.remove(nid)
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
        <button className="btn" onClick={handleBack} title="Voltar">
          ← Voltar
        </button>
        <div className="actionbar__spacer" />
        <span className="savestatus">
          {status === 'saving' ? 'Salvando…' : status === 'saved' ? 'Salvo' : ''}
        </span>
        <button
          className="btn btn--danger"
          onClick={handleDelete}
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
          onChange={(e) => edit({ title: e.target.value })}
        />
        <textarea
          className="editor__body"
          placeholder="Escreva sua anotação… (editor rico chega na Fase 3)"
          value={body}
          onChange={(e) => edit({ body: e.target.value })}
        />
      </main>
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Trash2, Check } from 'lucide-react'
import Titlebar from './Titlebar'

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
    await persist()
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
      <>
        <Titlebar showBack onBack={onClose} />
        <div className="flex flex-1 items-center justify-center text-[13px] text-muted-foreground">
          Carregando…
        </div>
      </>
    )
  }

  return (
    <>
      <Titlebar showBack onBack={handleBack} />

      {/* Actions row */}
      <div className="flex items-center justify-between border-b border-border bg-titlebar px-4 py-1.5">
        <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
          <span
            className={
              status === 'saving'
                ? 'inline-flex size-1.5 rounded-full bg-muted-foreground'
                : 'inline-flex size-1.5 rounded-full bg-emerald-400'
            }
          />
          {status === 'saving' ? 'Salvando…' : 'Salvo'}
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label="Excluir nota"
            onClick={handleDelete}
            className="flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-white/5 hover:text-danger"
          >
            <Trash2 className="size-3.5" />
          </button>
          <button
            aria-label="Concluir"
            onClick={handleBack}
            className="flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <Check className="size-4" strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {/* Meta header */}
      <div className="border-b border-border bg-panel-elev px-5 py-4">
        <input
          value={title}
          onChange={(e) => edit({ title: e.target.value })}
          placeholder="Nota sem título"
          className="w-full bg-transparent text-[17px] font-semibold leading-tight text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {/* Category + tags chips are visual placeholders; wired in Phase 4. */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <button
            disabled
            title="Em breve (Fase 4)"
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full bg-subtle px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground ring-1 ring-border"
          >
            + Categoria
          </button>
        </div>
      </div>

      {/* Body — plain editor for now; rich text (TipTap) + toolbar arrive in Phase 3. */}
      <textarea
        value={body}
        onChange={(e) => edit({ body: e.target.value })}
        placeholder="Escreva sua anotação…"
        className="flex-1 resize-none bg-panel px-6 py-5 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </>
  )
}

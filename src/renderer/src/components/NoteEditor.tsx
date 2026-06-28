import { useEffect, useRef, useState } from 'react'
import { Trash2, Check } from 'lucide-react'
import Titlebar from './Titlebar'
import RichEditor, { type BodyValue } from './RichEditor'

interface Props {
  /** Note id to edit, or null to create a new note. */
  id: number | null
  onClose: () => void
}

type SaveStatus = '' | 'saving' | 'saved'

const AUTOSAVE_DELAY = 600

export default function NoteEditor({ id, onClose }: Props): JSX.Element {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(id !== null)
  const [status, setStatus] = useState<SaveStatus>('')
  const [initial, setInitial] = useState<{ json: string | null; md: string | null }>({
    json: null,
    md: null
  })

  // Everything the (debounced) save reads lives in refs, so timers/flushes
  // always see the latest values regardless of render timing.
  const titleRef = useRef('')
  const bodyRef = useRef<BodyValue>({ json: '', md: '' })
  const savedRef = useRef({ title: '', md: '' })
  const noteIdRef = useRef<number | null>(id)
  const chain = useRef<Promise<void>>(Promise.resolve())
  const timer = useRef<ReturnType<typeof setTimeout>>()
  titleRef.current = title

  useEffect(() => {
    let active = true
    if (id === null) {
      savedRef.current = { title: '', md: '' }
      setLoading(false)
      return
    }
    window.api.notes.get(id).then((note) => {
      if (!active || !note) return
      setTitle(note.title)
      titleRef.current = note.title
      bodyRef.current = { json: note.bodyJson ?? '', md: note.bodyMd ?? '' }
      savedRef.current = { title: note.title, md: note.bodyMd ?? '' }
      setInitial({ json: note.bodyJson, md: note.bodyMd })
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [id])

  function persist(): Promise<void> {
    chain.current = chain.current.then(async () => {
      const t = titleRef.current.trim()
      const { json, md } = bodyRef.current
      const nid = noteIdRef.current
      const isEmptyNew = nid === null && !t && !md.trim()
      const isClean = t === savedRef.current.title && md === savedRef.current.md
      if (isEmptyNew || isClean) {
        setStatus('saved')
        return
      }
      const input = { title: t, bodyJson: json, bodyMd: md }
      if (nid === null) {
        const created = await window.api.notes.create(input)
        noteIdRef.current = created.id
      } else {
        await window.api.notes.update(nid, input)
      }
      savedRef.current = { title: t, md }
      setStatus('saved')
    })
    return chain.current
  }

  function schedule(): void {
    setStatus('saving')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => void persist(), AUTOSAVE_DELAY)
  }

  function onTitleChange(value: string): void {
    setTitle(value)
    titleRef.current = value
    schedule()
  }

  function onBodyChange(value: BodyValue): void {
    bodyRef.current = value
    schedule()
  }

  async function handleBack(): Promise<void> {
    if (timer.current) clearTimeout(timer.current)
    await persist()
    onClose()
  }

  async function handleDelete(): Promise<void> {
    if (timer.current) clearTimeout(timer.current)
    if (noteIdRef.current !== null) await window.api.notes.remove(noteIdRef.current)
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
          onChange={(e) => onTitleChange(e.target.value)}
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

      {/* Rich text body (TipTap) + floating formatting toolbar */}
      <RichEditor
        initialJson={initial.json}
        initialMarkdown={initial.md}
        onChange={onBodyChange}
      />
    </>
  )
}

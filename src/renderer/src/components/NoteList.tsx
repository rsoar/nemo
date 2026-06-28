import { useMemo, useState } from 'react'
import { Search, Plus, Filter, List as ListIcon } from 'lucide-react'
import type { Category, Note } from '@shared/types'
import clsx from 'clsx'
import Titlebar from './Titlebar'
import { formatWhen } from '../lib/format'

interface Props {
  notes: Note[]
  categories: Category[]
  onNew: () => void
  onOpen: (id: number) => void
}

export default function NoteList({ notes, categories, onNew, onOpen }: Props): JSX.Element {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<number | 'all'>('all')

  const byId = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return notes.filter((n) => {
      if (filter !== 'all' && n.categoryId !== filter) return false
      if (!q) return true
      return (
        n.title.toLowerCase().includes(q) ||
        (n.bodyMd ?? '').toLowerCase().includes(q) ||
        n.tags.some((t) => t.name.toLowerCase().includes(q))
      )
    })
  }, [notes, filter, query])

  const isFiltered = filter !== 'all' || query.trim().length > 0

  return (
    <>
      <Titlebar />

      <div className="px-4 pb-3 pt-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar notas…"
              className="h-9 w-full rounded-md bg-input pl-9 pr-3 text-sm text-foreground ring-1 ring-border transition-shadow placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={onNew}
            aria-label="Nova nota"
            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" strokeWidth={2.6} />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          <FilterPill label="Todas" active={filter === 'all'} onClick={() => setFilter('all')} />
          {categories.map((c) => (
            <FilterPill
              key={c.id}
              label={c.name}
              color={c.color}
              active={filter === c.id}
              onClick={() => setFilter(c.id)}
            />
          ))}
        </div>

        {isFiltered && (
          <button
            onClick={() => {
              setFilter('all')
              setQuery('')
            }}
            className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <Filter className="size-3" /> Limpar · {filtered.length}/{notes.length}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto border-t border-border">
        {filtered.length === 0 ? (
          <EmptyState search={isFiltered} />
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((note) => (
              <li key={note.id}>
                <NoteRow
                  note={note}
                  category={note.categoryId !== null ? byId.get(note.categoryId) : undefined}
                  onClick={() => onOpen(note.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

function FilterPill({
  label,
  active,
  color,
  onClick
}: {
  label: string
  active: boolean
  color?: string | null
  onClick: () => void
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
        active ? 'bg-subtle text-foreground' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {color && (
        <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      )}
      {label}
    </button>
  )
}

function NoteRow({
  note,
  category,
  onClick
}: {
  note: Note
  category?: Category
  onClick: () => void
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="group block w-full px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-medium text-foreground">
          {note.title || '(sem título)'}
        </span>
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {formatWhen(note.updatedAt)}
        </span>
      </div>
      {note.bodyMd && (
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
          {note.bodyMd}
        </p>
      )}
      {(category || note.tags.length > 0) && (
        <div className="mt-2.5 flex items-center gap-3">
          {category && (
            <div className="flex items-center gap-1.5">
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: category.color ?? 'var(--muted-foreground)' }}
              />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {category.name}
              </span>
            </div>
          )}
          {note.tags.length > 0 && (
            <div className="flex min-w-0 gap-1 text-[10px] text-muted-foreground">
              {note.tags.map((t) => (
                <span key={t.id} className="truncate">
                  #{t.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </button>
  )
}

function EmptyState({ search }: { search: boolean }): JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-subtle ring-1 ring-border">
        {search ? (
          <Search className="size-5 text-muted-foreground" />
        ) : (
          <ListIcon className="size-5 text-muted-foreground" />
        )}
      </div>
      <h3 className="mt-4 text-sm font-medium text-foreground">
        {search ? 'Nada encontrado' : 'Nenhuma nota ainda'}
      </h3>
      <p className="mt-1.5 max-w-[220px] text-[12px] leading-relaxed text-muted-foreground">
        {search
          ? 'Tente outra palavra ou limpe o filtro.'
          : 'Toque no + acima para criar sua primeira nota. Ela fica aqui, na borda da sua tela.'}
      </p>
    </div>
  )
}

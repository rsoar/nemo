import { useCallback, useEffect, useState } from 'react'
import type { Category, Note } from '@shared/types'
import NoteList from './components/NoteList'
import NoteEditor from './components/NoteEditor'

type View = { mode: 'list' } | { mode: 'editor'; id: number | null }

export default function App(): JSX.Element {
  const [notes, setNotes] = useState<Note[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [view, setView] = useState<View>({ mode: 'list' })

  const refresh = useCallback(async () => {
    setNotes(await window.api.notes.list())
  }, [])

  const reloadCategories = useCallback(async () => {
    setCategories(await window.api.categories.list())
  }, [])

  useEffect(() => {
    refresh()
    reloadCategories()
  }, [refresh, reloadCategories])

  return (
    <div className="flex h-full flex-col bg-panel text-foreground">
      {view.mode === 'list' ? (
        <NoteList
          notes={notes}
          categories={categories}
          onNew={() => setView({ mode: 'editor', id: null })}
          onOpen={(id) => setView({ mode: 'editor', id })}
        />
      ) : (
        <NoteEditor
          id={view.id}
          categories={categories}
          onCategoriesChange={reloadCategories}
          onClose={async () => {
            await refresh()
            setView({ mode: 'list' })
          }}
        />
      )}
    </div>
  )
}

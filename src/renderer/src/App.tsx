import { useCallback, useEffect, useState } from 'react'
import type { Note } from '@shared/types'
import NoteList from './components/NoteList'
import NoteEditor from './components/NoteEditor'

type View = { mode: 'list' } | { mode: 'editor'; id: number | null }

export default function App(): JSX.Element {
  const [notes, setNotes] = useState<Note[]>([])
  const [view, setView] = useState<View>({ mode: 'list' })

  const refresh = useCallback(async () => {
    setNotes(await window.api.notes.list())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <div className="flex h-full flex-col bg-panel text-foreground">
      {view.mode === 'list' ? (
        <NoteList
          notes={notes}
          onNew={() => setView({ mode: 'editor', id: null })}
          onOpen={(id) => setView({ mode: 'editor', id })}
        />
      ) : (
        <NoteEditor
          id={view.id}
          onClose={async () => {
            await refresh()
            setView({ mode: 'list' })
          }}
        />
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'

export default function Bubble(): JSX.Element {
  const [count, setCount] = useState(0)

  useEffect(() => {
    window.api.notes.list().then((notes) => setCount(notes.length))
  }, [])

  return (
    <button
      onClick={() => window.api.window.showPanel()}
      aria-label="Abrir memo"
      className="group relative grid size-14 place-items-center rounded-full bg-accent text-accent-foreground shadow-bubble transition-transform hover:scale-105 active:scale-95"
    >
      <span className="text-xl font-semibold tracking-tighter">m</span>
      <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-accent" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-panel text-[10px] font-bold text-accent ring-2 ring-background">
          {count}
        </span>
      )}
    </button>
  )
}

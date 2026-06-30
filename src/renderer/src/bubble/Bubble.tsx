import { useEffect, useState } from 'react'

export default function Bubble(): JSX.Element {
  const [count, setCount] = useState(0)

  useEffect(() => {
    window.api.notes.list().then((notes) => setCount(notes.length))
  }, [])

  return (
    <button
      onClick={() => window.api.window.showPanel()}
      aria-label="Abrir nemo"
      className="group relative grid size-14 place-items-center rounded-full bg-accent text-accent-foreground shadow-bubble transition-transform hover:scale-105 active:scale-95"
    >
      <svg viewBox="0 0 100 100" className="size-7" fill="#ffffff" aria-hidden>
        <rect x="24" y="28" width="40" height="12" rx="6" />
        <rect x="24" y="44" width="52" height="12" rx="6" />
        <rect x="24" y="60" width="46" height="12" rx="6" />
      </svg>
      <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-accent" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-panel text-[10px] font-bold text-accent ring-2 ring-background">
          {count}
        </span>
      )}
    </button>
  )
}

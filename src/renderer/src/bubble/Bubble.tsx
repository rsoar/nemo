import { useEffect, useState } from 'react'
import bubbleUrl from './bubble.svg'
import fishUrl from './fish.svg'

export default function Bubble(): JSX.Element {
  const [count, setCount] = useState(0)

  useEffect(() => {
    window.api.notes.list().then((notes) => setCount(notes.length))
  }, [])

  return (
    <button
      onClick={() => window.api.window.showPanel()}
      aria-label="Abrir nemo"
      className="group relative grid size-28 place-items-center transition-transform hover:scale-105 active:scale-95"
    >
      {/* Layer 1: the realistic water sphere (static). */}
      <img
        src={bubbleUrl}
        alt=""
        className="absolute inset-0 size-full object-contain [filter:drop-shadow(0_6px_12px_rgba(0,0,0,0.45))]"
      />

      {/* Layer 2: the fish, swimming, clipped to the sphere's circle. */}
      <span className="absolute inset-[6%] overflow-hidden rounded-full">
        <span className="fish-swim absolute inset-0 grid place-items-center">
          <img src={fishUrl} alt="" className="fish size-16 object-contain" />
        </span>
      </span>

      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-panel text-[10px] font-bold text-accent ring-2 ring-background">
          {count}
        </span>
      )}
    </button>
  )
}

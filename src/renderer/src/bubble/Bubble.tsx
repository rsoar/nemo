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
      className="group relative grid size-14 place-items-center rounded-full bg-accent shadow-bubble transition-transform hover:scale-105 active:scale-95"
    >
      {/* The "water": clips the fish to the circle so it can swim edge to edge. */}
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span className="fish-swim absolute inset-0 grid place-items-center">
          <Fish />
        </span>
      </span>

      <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-accent" />

      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-panel text-[10px] font-bold text-accent ring-2 ring-background">
          {count}
        </span>
      )}
    </button>
  )
}

/** A cute clownfish, facing right (the swim animation flips it when turning). */
function Fish(): JSX.Element {
  return (
    <svg viewBox="0 0 64 64" className="fish size-9" aria-hidden>
      <defs>
        <clipPath id="nemoBody">
          <ellipse cx="31" cy="33" rx="15" ry="10" />
        </clipPath>
      </defs>

      <g className="fish__tail">
        <path d="M16 33 L4 23 L9 33 L4 43 Z" fill="#ffffff" />
      </g>

      <g className="fish__body">
        <polygon points="27,24 37,16 39,25" fill="#ffffff" />
        <polygon points="30,42 37,42 33,48" fill="#ffffff" />
        <ellipse cx="31" cy="33" rx="15" ry="10" fill="#ffffff" />
        <g clipPath="url(#nemoBody)">
          <rect x="26" y="20" width="4.5" height="26" fill="var(--accent)" />
          <rect x="35" y="20" width="3.5" height="26" fill="var(--accent)" />
        </g>
        <circle cx="40" cy="31" r="2.6" fill="#1d1f27" />
        <circle cx="41" cy="30" r="0.9" fill="#ffffff" />
      </g>
    </svg>
  )
}

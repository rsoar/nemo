import type { ReactNode } from 'react'
import { Minus, X, ChevronLeft } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  showBack?: boolean
  onBack?: () => void
}

/** Frameless titlebar: brand (or back) on the left, window controls on the right. */
export default function Titlebar({ showBack, onBack }: Props): JSX.Element {
  return (
    <header className="drag flex h-10 shrink-0 items-center justify-between border-b border-border bg-titlebar pl-3 pr-2">
      <div className="flex min-w-0 items-center gap-2">
        {showBack ? (
          <button
            onClick={onBack}
            className="no-drag flex items-center gap-1 rounded px-1.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" strokeWidth={2} />
            Notas
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              memo
            </span>
          </div>
        )}
      </div>

      <div className="no-drag flex items-center gap-1">
        <WindowBtn label="Minimizar" onClick={() => window.api.window.minimize()}>
          <Minus className="size-3.5" strokeWidth={2.4} />
        </WindowBtn>
        <WindowBtn label="Fechar" danger onClick={() => window.api.window.close()}>
          <X className="size-3.5" strokeWidth={2.4} />
        </WindowBtn>
      </div>
    </header>
  )
}

function WindowBtn({
  children,
  onClick,
  label,
  danger
}: {
  children: ReactNode
  onClick: () => void
  label: string
  danger?: boolean
}): JSX.Element {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={clsx(
        'flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-white/5',
        danger ? 'hover:text-danger' : 'hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}

import { useEffect, useState } from 'react'

export default function App(): JSX.Element {
  const [ipcStatus, setIpcStatus] = useState<string>('…')

  useEffect(() => {
    // Phase 0 smoke test: prove the renderer ↔ preload ↔ main bridge works.
    window.api
      .ping()
      .then((res) => setIpcStatus(res))
      .catch(() => setIpcStatus('falha no IPC'))
  }, [])

  return (
    <div className="app">
      <header className="titlebar">
        <span className="titlebar__brand">memo</span>
        <div className="titlebar__controls">
          <button
            className="winbtn"
            title="Minimizar (vira bolha)"
            onClick={() => window.api.window.minimize()}
          >
            &#x2013;
          </button>
          <button
            className="winbtn winbtn--close"
            title="Fechar (vai para a bandeja)"
            onClick={() => window.api.window.close()}
          >
            &#x2715;
          </button>
        </div>
      </header>
      <main className="panel">
        <h1>memo</h1>
        <p className="panel__hint">Painel arrastável e redimensionável — Fase 1.</p>
        <p className="panel__status">
          Ponte IPC: <code>{ipcStatus}</code>
        </p>
      </main>
    </div>
  )
}

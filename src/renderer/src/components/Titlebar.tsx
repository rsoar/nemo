export default function Titlebar(): JSX.Element {
  return (
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
  )
}

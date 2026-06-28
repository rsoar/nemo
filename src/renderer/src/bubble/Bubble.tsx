export default function Bubble(): JSX.Element {
  return (
    <button
      className="bubble"
      title="Abrir memo"
      onClick={() => window.api.window.showPanel()}
    >
      m
    </button>
  )
}

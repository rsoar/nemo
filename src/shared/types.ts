// Domain + IPC contract shared by main, preload and renderer.
// This file is the seam that future remote-SQL migration plugs into:
// the renderer only ever depends on the `MemoApi` interface, never on the DB.

export interface Category {
  id: number
  name: string
  color: string | null
}

export interface Tag {
  id: number
  name: string
}

export interface Note {
  id: number
  title: string
  /** TipTap/ProseMirror document JSON, serialized as string (null until editor lands). */
  bodyJson: string | null
  /** Markdown rendering of the body, used for search/export. */
  bodyMd: string | null
  categoryId: number | null
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

/** Frameless window controls driven from the renderer titlebar / bubble. */
export interface WindowControls {
  /** Hide the panel and reveal the floating bubble. */
  minimize: () => void
  /** Hide everything to the tray (app keeps running). */
  close: () => void
  /** Reopen the panel (used by the bubble). */
  showPanel: () => void
}

/** The typed surface exposed to the renderer via contextBridge as `window.api`. */
export interface MemoApi {
  /** Phase 0 smoke-test channel; replaced by real note CRUD in Phase 2. */
  ping: () => Promise<string>
  window: WindowControls
}

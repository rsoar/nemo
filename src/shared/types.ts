// Domain + IPC contract shared by main, preload and renderer.
// This file is the seam that future remote-SQL migration plugs into:
// the renderer only ever depends on the `NemoApi` interface, never on the DB.

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

/** Fields accepted when creating or updating a note. */
export interface NoteInput {
  title: string
  bodyJson?: string | null
  bodyMd?: string | null
  categoryId?: number | null
  /** Tag names; the repository upserts them and (re)links the note. Omit to leave unchanged. */
  tags?: string[]
}

/** Note CRUD surface exposed to the renderer. */
export interface NotesApi {
  list: () => Promise<Note[]>
  get: (id: number) => Promise<Note | null>
  create: (input: NoteInput) => Promise<Note>
  update: (id: number, input: NoteInput) => Promise<Note>
  remove: (id: number) => Promise<void>
}

/** Category surface exposed to the renderer. */
export interface CategoriesApi {
  list: () => Promise<Category[]>
  create: (name: string, color: string | null) => Promise<Category>
  remove: (id: number) => Promise<void>
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
export interface NemoApi {
  notes: NotesApi
  categories: CategoriesApi
  window: WindowControls
}

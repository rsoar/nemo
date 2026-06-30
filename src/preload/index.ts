import { contextBridge, ipcRenderer } from 'electron'
import type { NemoApi, NoteInput } from '../shared/types'

// The single, typed bridge between renderer and main. The renderer can only
// reach the main process through the channels declared in `NemoApi`.
const api: NemoApi = {
  notes: {
    list: () => ipcRenderer.invoke('notes:list'),
    get: (id) => ipcRenderer.invoke('notes:get', id),
    create: (input: NoteInput) => ipcRenderer.invoke('notes:create', input),
    update: (id, input: NoteInput) => ipcRenderer.invoke('notes:update', id, input),
    remove: (id) => ipcRenderer.invoke('notes:remove', id)
  },
  categories: {
    list: () => ipcRenderer.invoke('categories:list'),
    create: (name: string, color: string | null) =>
      ipcRenderer.invoke('categories:create', name, color),
    remove: (id: number) => ipcRenderer.invoke('categories:remove', id)
  },
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    close: () => ipcRenderer.send('window:close'),
    showPanel: () => ipcRenderer.send('window:show')
  }
}

contextBridge.exposeInMainWorld('api', api)

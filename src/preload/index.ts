import { contextBridge, ipcRenderer } from 'electron'
import type { MemoApi } from '../shared/types'

// The single, typed bridge between renderer and main. The renderer can only
// reach the main process through the channels declared in `MemoApi`.
const api: MemoApi = {
  ping: () => ipcRenderer.invoke('ping'),
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    close: () => ipcRenderer.send('window:close'),
    showPanel: () => ipcRenderer.send('window:show')
  }
}

contextBridge.exposeInMainWorld('api', api)

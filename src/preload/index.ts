import { contextBridge, ipcRenderer } from 'electron'
import type { MemoApi } from '../shared/types'

// The single, typed bridge between renderer and main. The renderer can only
// reach the main process through the channels declared in `MemoApi`.
const api: MemoApi = {
  ping: () => ipcRenderer.invoke('ping')
}

contextBridge.exposeInMainWorld('api', api)

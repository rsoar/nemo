import { ipcMain } from 'electron'
import type { WindowManager } from '../windows/manager'
import { noteRepository } from '../db/noteRepository'
import { categoryRepository } from '../db/categoryRepository'
import type { NoteInput } from '../../shared/types'

/**
 * Registers all IPC handlers: note CRUD (Phase 2) and the frameless window
 * controls (Phase 1).
 */
export function registerIpcHandlers(windows: WindowManager): void {
  // Notes CRUD
  ipcMain.handle('notes:list', () => noteRepository.list())
  ipcMain.handle('notes:get', (_e, id: number) => noteRepository.get(id))
  ipcMain.handle('notes:create', (_e, input: NoteInput) => noteRepository.create(input))
  ipcMain.handle('notes:update', (_e, id: number, input: NoteInput) =>
    noteRepository.update(id, input)
  )
  ipcMain.handle('notes:remove', (_e, id: number) => noteRepository.remove(id))

  // Categories
  ipcMain.handle('categories:list', () => categoryRepository.list())

  // Window controls
  ipcMain.on('window:minimize', () => windows.minimizeToBubble())
  ipcMain.on('window:close', () => windows.hideToTray())
  ipcMain.on('window:show', () => windows.showPanel())
}

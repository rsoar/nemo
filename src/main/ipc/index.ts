import { ipcMain } from 'electron'
import type { WindowManager } from '../windows/manager'

/**
 * Registers all IPC handlers. Phase 1 wires the frameless window controls;
 * Phase 2 will add note/tag/category CRUD backed by the SQLite repositories.
 */
export function registerIpcHandlers(windows: WindowManager): void {
  ipcMain.handle('ping', () => 'pong')

  ipcMain.on('window:minimize', () => windows.minimizeToBubble())
  ipcMain.on('window:close', () => windows.hideToTray())
  ipcMain.on('window:show', () => windows.showPanel())
}

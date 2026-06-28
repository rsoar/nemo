import { ipcMain } from 'electron'

/**
 * Registers all IPC handlers. Phase 0 only wires a smoke-test `ping`;
 * Phase 2 adds note/tag/category CRUD backed by the SQLite repositories.
 */
export function registerIpcHandlers(): void {
  ipcMain.handle('ping', () => 'pong')
}

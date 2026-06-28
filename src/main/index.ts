import { app, BrowserWindow, Tray } from 'electron'
import { WindowManager } from './windows/manager'
import { createTray } from './windows/tray'
import { registerIpcHandlers } from './ipc'

// Keep references alive for the whole app lifetime.
let windows: WindowManager
let tray: Tray

function bootstrap(): void {
  windows = new WindowManager()
  registerIpcHandlers(windows)
  tray = createTray(windows)

  windows.showPanel()

  app.on('activate', () => {
    // macOS: re-open the panel when the dock icon is clicked and nothing is open.
    if (BrowserWindow.getAllWindows().length === 0) windows.showPanel()
  })
}

app.whenReady().then(bootstrap)

// Don't quit when windows are hidden — memo lives in the tray. Quit is explicit
// (tray "Sair"). On macOS the app also traditionally stays alive.
app.on('window-all-closed', () => {
  // no-op: closing windows hides them; quitting happens via the tray.
})

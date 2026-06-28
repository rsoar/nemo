import { app, BrowserWindow } from 'electron'
import { createPanelWindow } from './windows/panel'
import { registerIpcHandlers } from './ipc'

function bootstrap(): void {
  registerIpcHandlers()
  createPanelWindow()

  app.on('activate', () => {
    // macOS: re-create the window when the dock icon is clicked and none are open.
    if (BrowserWindow.getAllWindows().length === 0) createPanelWindow()
  })
}

app.whenReady().then(bootstrap)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

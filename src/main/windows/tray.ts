import { join } from 'path'
import { app, Menu, Tray, nativeImage } from 'electron'
import type { WindowManager } from './manager'

/**
 * Creates the system tray icon. Left-click reopens the panel; the context menu
 * offers "Abrir" and "Sair". The returned Tray must be kept referenced so it is
 * not garbage-collected.
 */
export function createTray(windows: WindowManager): Tray {
  const iconPath = join(__dirname, '../../resources/tray-icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  const tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon)

  tray.setToolTip('memo')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Abrir', click: () => windows.showPanel() },
      { type: 'separator' },
      { label: 'Sair', click: () => app.quit() }
    ])
  )

  tray.on('click', () => windows.showPanel())
  return tray
}

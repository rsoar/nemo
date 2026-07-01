import { join } from 'path'
import { BrowserWindow, screen } from 'electron'

// Window is larger than the ~80px circle to leave room for shadow + count badge.
const BUBBLE_SIZE = 116
const MARGIN = 16

function loadBubble(win: BrowserWindow): void {
  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(`${process.env.ELECTRON_RENDERER_URL}/bubble.html`)
  } else {
    win.loadFile(join(__dirname, '../renderer/bubble.html'))
  }
}

/**
 * Creates the floating bubble window: a small, transparent, frameless,
 * always-on-top circle docked at the bottom-right of the screen. Clicking it
 * (handled in the renderer) reopens the panel. Starts hidden — the
 * WindowManager controls visibility.
 */
export function createBubbleWindow(): BrowserWindow {
  const { workArea } = screen.getPrimaryDisplay()

  const win = new BrowserWindow({
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    x: workArea.x + workArea.width - BUBBLE_SIZE - MARGIN,
    y: workArea.y + workArea.height - BUBBLE_SIZE - MARGIN,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false
    }
  })

  loadBubble(win)
  return win
}

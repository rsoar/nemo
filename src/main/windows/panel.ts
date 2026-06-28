import { join } from 'path'
import { BrowserWindow, screen, shell } from 'electron'

/** Default width of the side panel; user can resize from here. */
const PANEL_WIDTH = 420
const PANEL_MIN_WIDTH = 320

function loadRenderer(win: BrowserWindow): void {
  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

/**
 * Pins the panel to the right edge of whichever display it sits on, with its
 * top at the work-area top and height limited to the work area. Applied AFTER
 * the window is shown because many Linux WMs ignore constructor bounds and
 * vertically re-center frameless windows (which pushed the header off-screen).
 */
function positionPanel(win: BrowserWindow): void {
  const { workArea } = screen.getDisplayMatching(win.getBounds())
  const width = Math.min(win.getBounds().width || PANEL_WIDTH, workArea.width)
  win.setBounds({
    x: workArea.x + workArea.width - width,
    y: workArea.y,
    width,
    height: workArea.height
  })
}

/**
 * Creates the main side-panel window: frameless, always-on-top, draggable and
 * width-resizable, initially anchored to the right edge of the primary display.
 * (Edge-snapping while dragging is a planned refinement.)
 */
export function createPanelWindow(): BrowserWindow {
  const { workArea } = screen.getPrimaryDisplay()

  const win = new BrowserWindow({
    width: PANEL_WIDTH,
    minWidth: PANEL_MIN_WIDTH,
    height: workArea.height,
    x: workArea.x + workArea.width - PANEL_WIDTH,
    y: workArea.y,
    frame: false,
    resizable: true,
    movable: true,
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false
    }
  })

  win.on('ready-to-show', () => {
    positionPanel(win)
    win.show()
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  loadRenderer(win)
  return win
}

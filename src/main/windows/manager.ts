import { BrowserWindow } from 'electron'
import { createPanelWindow } from './panel'
import { createBubbleWindow } from './bubble'

/**
 * Coordinates the two windows that make up nemo's shell: the side **panel** and
 * the floating **bubble**. Exactly one is visible at a time; "closing" hides
 * both to the tray without quitting the app.
 */
export class WindowManager {
  private panel: BrowserWindow | null = null
  private bubble: BrowserWindow | null = null

  private ensurePanel(): BrowserWindow {
    if (!this.panel || this.panel.isDestroyed()) {
      this.panel = createPanelWindow()
    }
    return this.panel
  }

  private ensureBubble(): BrowserWindow {
    if (!this.bubble || this.bubble.isDestroyed()) {
      this.bubble = createBubbleWindow()
    }
    return this.bubble
  }

  /** Show the panel and hide the bubble. */
  showPanel(): void {
    this.bubble?.hide()
    const panel = this.ensurePanel()
    panel.show()
    panel.focus()
  }

  /** Minimize: hide the panel and reveal the floating bubble. */
  minimizeToBubble(): void {
    this.panel?.hide()
    this.ensureBubble().show()
  }

  /** "Close": hide everything to the tray; the app keeps running. */
  hideToTray(): void {
    this.panel?.hide()
    this.bubble?.hide()
  }
}

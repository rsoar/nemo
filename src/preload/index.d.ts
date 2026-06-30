import type { NemoApi } from '../shared/types'

declare global {
  interface Window {
    api: NemoApi
  }
}

export {}

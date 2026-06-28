import type { MemoApi } from '../shared/types'

declare global {
  interface Window {
    api: MemoApi
  }
}

export {}

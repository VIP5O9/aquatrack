import 'fake-indexeddb/auto'

/**
 * Setup polyfills and environment for Node.js Vitest runner.
 */
class MemoryStorage {
  constructor() {
    this.store = new Map()
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null
  }
  setItem(key, value) {
    this.store.set(key, String(value))
  }
  removeItem(key) {
    this.store.delete(key)
  }
  clear() {
    this.store.clear()
  }
  get length() {
    return this.store.size
  }
  key(index) {
    return Array.from(this.store.keys())[index] ?? null
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = new MemoryStorage()
}

if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    localStorage: globalThis.localStorage,
    matchMedia: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
    location: { hostname: 'localhost' },
    addEventListener: () => {},
    removeEventListener: () => {},
  }
}

if (typeof globalThis.document === 'undefined') {
  const elements = new Map()
  globalThis.document = {
    documentElement: {
      dataset: {},
      style: {},
    },
    querySelector: (selector) => {
      if (!elements.has(selector)) {
        elements.set(selector, {
          setAttribute: () => {},
          getAttribute: () => null,
          click: () => {},
        })
      }
      return elements.get(selector)
    },
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      setAttribute: () => {},
      getAttribute: () => null,
      click: () => {},
      href: '',
      download: '',
    }),
    addEventListener: () => {},
    removeEventListener: () => {},
  }
}

if (typeof globalThis.URL.createObjectURL === 'undefined') {
  globalThis.URL.createObjectURL = () => 'blob:mock-url'
  globalThis.URL.revokeObjectURL = () => {}
}

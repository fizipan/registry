import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, beforeEach, vi } from "vitest"

// jsdom implements neither; Radix Popover needs ResizeObserver.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub

Element.prototype.scrollIntoView = vi.fn()
// jsdom logs "not implemented" for scrollTo; the docs router calls it on navigation.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
// jsdom has no matchMedia; the theme provider reads the system preference.
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia

beforeEach(() => {
  vi.mocked(Element.prototype.scrollIntoView).mockReset()
})

afterEach(cleanup)

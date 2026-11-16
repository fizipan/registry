import "@testing-library/jest-dom/vitest"
import { beforeEach, vi } from "vitest"

// jsdom implements neither; Radix Popover needs ResizeObserver.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub

Element.prototype.scrollIntoView = vi.fn()

beforeEach(() => {
  vi.mocked(Element.prototype.scrollIntoView).mockReset()
})

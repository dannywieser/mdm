import { act, cleanup, render } from "@testing-library/react"
import { useCallback, useEffect, useRef } from "react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { useMasonryRowSpan } from "./useMasonryRowSpan"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

class ResizeObserverStub {
  static readonly instances: ResizeObserverStub[] = []

  callback: ResizeObserverCallback
  observed: Element | undefined

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
    ResizeObserverStub.instances.push(this)
  }

  observe(element: Element) {
    this.observed = element
  }

  disconnect() {
    this.observed = undefined
  }

  trigger() {
    this.callback([], this as unknown as ResizeObserver)
  }
}

const TestComponent = ({ heightPx }: { heightPx: number }) => {
  const { ref, rowSpan } = useMasonryRowSpan({ gapPx: 16, rowHeightPx: 8 })
  const heightRef = useRef(heightPx)

  useEffect(() => {
    heightRef.current = heightPx
  }, [heightPx])

  const measuredRef = useCallback(
    (element: HTMLElement | null) => {
      if (element) {
        Object.defineProperty(element, "offsetHeight", {
          configurable: true,
          get: () => heightRef.current,
        })
      }
      ref(element)
    },
    [ref],
  )

  return <div data-testid="masonry-item" data-row-span={rowSpan} ref={measuredRef} />
}

describe("useMasonryRowSpan", () => {
  test("computes the row span from the element height on mount", () => {
    ResizeObserverStub.instances = []
    vi.stubGlobal("ResizeObserver", ResizeObserverStub)

    const { getByTestId } = render(<TestComponent heightPx={100} />)

    expect(getByTestId("masonry-item").dataset.rowSpan).toBe("5")
  })

  test("recomputes the row span when the observer reports a resize", () => {
    ResizeObserverStub.instances = []
    vi.stubGlobal("ResizeObserver", ResizeObserverStub)

    const { getByTestId, rerender } = render(<TestComponent heightPx={100} />)

    rerender(<TestComponent heightPx={220} />)

    act(() => {
      ResizeObserverStub.instances.at(-1)?.trigger()
    })

    expect(getByTestId("masonry-item").dataset.rowSpan).toBe("10")
  })
})

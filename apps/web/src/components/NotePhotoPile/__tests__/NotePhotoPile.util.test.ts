import { describe, expect, test } from "vitest"

import {
  buildPhotoTransform,
  getPhotoPlacement,
  getPileMaxWidthPx,
  PHOTO_SIZE_PX,
  PILE_HEIGHT_PX,
  PILE_PADDING_PX,
} from "../NotePhotoPile.util"

describe("getPhotoPlacement", () => {
  const placementFor = (noteId: string, index = 0, count = 5) =>
    getPhotoPlacement({ count, index, noteId })

  test("returns the same placement for the same note", () => {
    expect(placementFor("notes/trip.md")).toEqual(placementFor("notes/trip.md"))
  })

  test("scatters different notes at the same index differently", () => {
    const first = placementFor("notes/trip.md")
    const second = placementFor("notes/dinner.md")

    expect([first.offsetX, first.offsetY, first.rotation]).not.toEqual([
      second.offsetX,
      second.offsetY,
      second.rotation,
    ])
  })

  test("keeps the tilt within the pile's rotation range", () => {
    for (let index = 0; index < 40; index += 1) {
      const { rotation } = placementFor(`note-${String(index)}.md`)
      expect(Math.abs(rotation)).toBeLessThanOrEqual(9)
    }
  })

  test("keeps the jitter within the pile's padding", () => {
    for (let index = 0; index < 40; index += 1) {
      const { offsetX, offsetY } = placementFor(`note-${String(index)}.md`)
      expect(Math.abs(offsetX)).toBeLessThanOrEqual(PILE_PADDING_PX)
      expect(Math.abs(offsetY)).toBeLessThanOrEqual(PILE_PADDING_PX)
    }
  })

  test("stacks later prints on top of earlier ones", () => {
    expect(placementFor("a.md", 0).zIndex).toBeLessThan(placementFor("b.md", 1).zIndex)
  })

  test("starts the first print at the left edge of the pile", () => {
    expect(placementFor("a.md", 0).left).toBe(
      `calc((100% - ${String(PHOTO_SIZE_PX)}px) * 0.0000)`,
    )
  })

  test("spaces prints evenly across the pile's width", () => {
    expect(placementFor("c.md", 2, 5).left).toBe(
      `calc((100% - ${String(PHOTO_SIZE_PX)}px) * 0.5000)`,
    )
  })

  test("places the last print against the far edge of the pile", () => {
    expect(placementFor("e.md", 4, 5).left).toBe(
      `calc((100% - ${String(PHOTO_SIZE_PX)}px) * 1.0000)`,
    )
  })

  test("places a lone print at the left edge without dividing by zero", () => {
    expect(placementFor("only.md", 0, 1).left).toBe(
      `calc((100% - ${String(PHOTO_SIZE_PX)}px) * 0.0000)`,
    )
  })
})

describe("getPileMaxWidthPx", () => {
  test("fits a single print exactly", () => {
    expect(getPileMaxWidthPx(1)).toBe(PHOTO_SIZE_PX)
  })

  test("adds a fixed step of overlap for every print after the first", () => {
    const step = getPileMaxWidthPx(3) - getPileMaxWidthPx(2)

    expect(step).toBeGreaterThan(0)
    expect(step).toBeLessThan(PHOTO_SIZE_PX)
    expect(getPileMaxWidthPx(5)).toBe(PHOTO_SIZE_PX + step * 4)
  })

  test("never goes below a single print for an empty pile", () => {
    expect(getPileMaxWidthPx(0)).toBe(PHOTO_SIZE_PX)
  })
})

describe("buildPhotoTransform", () => {
  test("combines the jitter and tilt into a single transform", () => {
    expect(
      buildPhotoTransform({
        left: "0px",
        offsetX: -4,
        offsetY: 7,
        rotation: -3,
        zIndex: 1,
      }),
    ).toBe("translate(-4px, 7px) rotate(-3deg)")
  })
})

describe("PILE_HEIGHT_PX", () => {
  test("leaves room for a print plus the jitter above and below it", () => {
    expect(PILE_HEIGHT_PX).toBe(PHOTO_SIZE_PX + PILE_PADDING_PX * 2)
  })
})

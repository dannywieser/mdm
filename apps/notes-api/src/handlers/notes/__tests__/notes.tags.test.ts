import { injectTagPlaceholders } from "../notes.tags"

describe("injectTagPlaceholders", () => {
  test("returns body unchanged when there are no tags", () => {
    const { processedBody, tagValues } = injectTagPlaceholders("Some plain text.")

    expect(processedBody).toBe("Some plain text.")
    expect(tagValues).toEqual([])
  })

  test("replaces a simple tag with a placeholder", () => {
    const { processedBody, tagValues } = injectTagPlaceholders("Journal entry #personal/daily today.")

    expect(processedBody).toBe("Journal entry TGPH0ENDTG today.")
    expect(tagValues).toEqual(["personal/daily"])
  })

  test("replaces a Bear-style multi-word tag with a placeholder", () => {
    const { processedBody, tagValues } = injectTagPlaceholders("Reading #book club# this week.")

    expect(processedBody).toBe("Reading TGPH0ENDTG this week.")
    expect(tagValues).toEqual(["book club"])
  })

  test("replaces multiple tags in document order", () => {
    const { processedBody, tagValues } = injectTagPlaceholders("#todo and #urgent")

    expect(processedBody).toBe("TGPH0ENDTG and TGPH1ENDTG")
    expect(tagValues).toEqual(["todo", "urgent"])
  })

  test("does not replace an ATX heading", () => {
    const { processedBody, tagValues } = injectTagPlaceholders("# Heading\n\ntext")

    expect(processedBody).toBe("# Heading\n\ntext")
    expect(tagValues).toEqual([])
  })
})

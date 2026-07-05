import { createFileID } from "../createFileID"

describe("createFileID", () => {
  test("returns deterministic IDs for equivalent path separators", () => {
    const namespace = "6ba7b811-9dad-11d1-80b4-00c04fd430c8"

    const unixId = createFileID("/notes/topic/welcome.md", namespace)
    const windowsId = createFileID("\\notes\\topic\\welcome.md", namespace)

    expect(unixId).toBe(windowsId)
  })
})

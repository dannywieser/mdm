import { getObjectValue } from "./getObjectValue"
import { getValueByPath } from "./getValueByPath"

describe("object value helpers", () => {
  test("getObjectValue returns property values for object inputs", () => {
    expect(getObjectValue({ title: "Welcome" }, "title")).toBe("Welcome")
  })

  test("getObjectValue returns undefined for non-object inputs", () => {
    expect(getObjectValue(null, "title")).toBeUndefined()
    expect(getObjectValue("text", "length")).toBeUndefined()
  })

  test("getValueByPath resolves nested values", () => {
    expect(
      getValueByPath(
        {
          frontmatter: {
            topic: ["Reading"],
          },
        },
        "frontmatter.topic",
      ),
    ).toEqual(["Reading"])
  })

  test("getValueByPath ignores empty path segments", () => {
    expect(getValueByPath({ frontmatter: { type: "book" } }, ".frontmatter..type")).toBe(
      "book",
    )
  })

  test("getValueByPath returns undefined when a segment is missing", () => {
    expect(getValueByPath({ frontmatter: {} }, "frontmatter.type")).toBeUndefined()
  })
})

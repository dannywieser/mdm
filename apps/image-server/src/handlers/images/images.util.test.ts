import { buildImgproxyUrlPath, resolveImagePath } from "./images.util"

describe("image util helpers", () => {
  test("resolveImagePath allows safe local paths", () => {
    expect(resolveImagePath("folder/image.png")).toBe("folder/image.png")
    expect(resolveImagePath("/folder/image.png")).toBe("folder/image.png")
    expect(resolveImagePath("./folder/image.png")).toBe("folder/image.png")
  })

  test("resolveImagePath rejects traversal and external sources", () => {
    expect(resolveImagePath("../secret.png")).toBeNull()
    expect(resolveImagePath("../../secret.png")).toBeNull()
    expect(resolveImagePath("http://example.com/a.jpg")).toBeNull()
    expect(resolveImagePath("data:image/png;base64,abc")).toBeNull()
  })

  test("buildImgproxyUrlPath creates imgproxy local plain path", () => {
    expect(
      buildImgproxyUrlPath({
        imagePath: "daily/photo one.jpg",
        imagesRoot: "/data/images",
        maxWidth: 800,
        maxHeight: 600,
      }),
    ).toBe(
      "/unsafe/rs:fit:800:600:0/plain/local:///data/images/daily/photo%20one.jpg",
    )
  })
})

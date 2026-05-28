import { buildImgproxyUrl, resolveImagePath } from "./images.util"

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

  test("buildImgproxyUrl creates imgproxy local plain url", () => {
    expect(
      buildImgproxyUrl({
        imagePath: "daily/photo one.jpg",
        imagesRoot: "/data/images",
        imgproxyBaseUrl: "http://imgproxy:8080",
        maxWidth: 800,
      }),
    ).toBe(
      "http://imgproxy:8080/unsafe/rs:fit:800:0:0/plain/local:///data/images/daily/photo%20one.jpg",
    )
  })
})

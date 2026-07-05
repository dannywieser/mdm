import { describe, expect, test, vi } from "vitest"

import { startService } from "./startService"

const spawnMock = vi.hoisted(() => vi.fn())

vi.mock("node:child_process", () => ({ spawn: spawnMock }))

vi.mock("./waitForHealth", () => ({
  waitForHealth: vi.fn((url: string) =>
    url.includes("4310") ? Promise.resolve() : Promise.reject(new Error("unhealthy")),
  ),
}))

describe("startService", () => {
  test("spawns the server and resolves once healthy", async () => {
    const kill = vi.fn()
    spawnMock.mockReturnValue({ kill })

    const service = await startService({
      env: { NOTES_ROOT: "/vault" },
      port: 4310,
      serverPath: "/apps/notes-api/dist/server.js",
    })

    const [command, args, options] = spawnMock.mock.calls[0] as [
      string,
      string[],
      { env: Record<string, string>; stdio: string },
    ]
    expect(command).toBe(process.execPath)
    expect(args).toEqual(["/apps/notes-api/dist/server.js"])
    expect(options.env).toMatchObject({ NOTES_ROOT: "/vault", PORT: "4310" })
    expect(options.stdio).toBe("ignore")
    expect(service.baseUrl).toBe("http://127.0.0.1:4310")

    service.stop()
    expect(kill).toHaveBeenCalled()
  })

  test("kills the child process when the service never becomes healthy", async () => {
    const kill = vi.fn()
    spawnMock.mockReturnValue({ kill })

    await expect(
      startService({ env: {}, port: 4311, serverPath: "/server.js" }),
    ).rejects.toThrow("unhealthy")
    expect(kill).toHaveBeenCalled()
  })
})

import { expandRecurrence } from "../expandRecurrence"

describe("expandRecurrence", () => {
  test("expands a daily rule across the window", () => {
    expect(
      expandRecurrence({
        anchorDate: "2026-03-01",
        from: "2026-03-01",
        rule: { interval: 1, unit: "day" },
        to: "2026-03-04",
      }),
    ).toEqual(["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04"])
  })

  test("honours the interval of an every-N-days rule", () => {
    expect(
      expandRecurrence({
        anchorDate: "2026-03-01",
        from: "2026-03-01",
        rule: { interval: 3, unit: "day" },
        to: "2026-03-10",
      }),
    ).toEqual(["2026-03-01", "2026-03-04", "2026-03-07", "2026-03-10"])
  })

  test("keeps a weekly rule on the anchor's weekday", () => {
    expect(
      expandRecurrence({
        anchorDate: "2026-03-02",
        from: "2026-03-01",
        rule: { interval: 1, unit: "week" },
        to: "2026-03-31",
      }),
    ).toEqual(["2026-03-02", "2026-03-09", "2026-03-16", "2026-03-23", "2026-03-30"])
  })

  test("stays in phase when the window starts long after the anchor", () => {
    expect(
      expandRecurrence({
        anchorDate: "2020-01-01",
        from: "2026-03-01",
        rule: { interval: 2, unit: "week" },
        to: "2026-03-31",
      }),
    ).toEqual(["2026-03-04", "2026-03-18"])
  })

  test("expands a monthly rule", () => {
    expect(
      expandRecurrence({
        anchorDate: "2026-01-15",
        from: "2026-01-01",
        rule: { interval: 1, unit: "month" },
        to: "2026-04-30",
      }),
    ).toEqual(["2026-01-15", "2026-02-15", "2026-03-15", "2026-04-15"])
  })

  test("clamps a month-end anchor to shorter months without drifting", () => {
    expect(
      expandRecurrence({
        anchorDate: "2026-01-31",
        from: "2026-01-01",
        rule: { interval: 1, unit: "month" },
        to: "2026-04-30",
      }),
    ).toEqual(["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30"])
  })

  test("expands a quarterly rule", () => {
    expect(
      expandRecurrence({
        anchorDate: "2026-01-10",
        from: "2026-01-01",
        rule: { interval: 3, unit: "month" },
        to: "2026-12-31",
      }),
    ).toEqual(["2026-01-10", "2026-04-10", "2026-07-10", "2026-10-10"])
  })

  test("expands a yearly rule", () => {
    expect(
      expandRecurrence({
        anchorDate: "2024-06-01",
        from: "2026-01-01",
        rule: { interval: 1, unit: "year" },
        to: "2027-12-31",
      }),
    ).toEqual(["2026-06-01", "2027-06-01"])
  })

  test("projects into a distant future month with no configured horizon", () => {
    expect(
      expandRecurrence({
        anchorDate: "2026-01-15",
        from: "2099-07-01",
        rule: { interval: 1, unit: "month" },
        to: "2099-07-31",
      }),
    ).toEqual(["2099-07-15"])
  })

  test("projects a daily rule into a distant future month", () => {
    const occurrences = expandRecurrence({
      anchorDate: "2000-01-01",
      from: "2099-07-01",
      rule: { interval: 1, unit: "day" },
      to: "2099-07-03",
    })
    expect(occurrences).toEqual(["2099-07-01", "2099-07-02", "2099-07-03"])
  })

  test("never projects an occurrence before the anchor", () => {
    expect(
      expandRecurrence({
        anchorDate: "2026-03-10",
        from: "2026-01-01",
        rule: { interval: 1, unit: "month" },
        to: "2026-03-31",
      }),
    ).toEqual(["2026-03-10"])
  })

  test("stops at the until date", () => {
    expect(
      expandRecurrence({
        anchorDate: "2026-01-15",
        from: "2026-01-01",
        rule: { interval: 1, unit: "month" },
        to: "2026-12-31",
        until: "2026-03-20",
      }),
    ).toEqual(["2026-01-15", "2026-02-15", "2026-03-15"])
  })

  test("returns nothing when the window ends before the anchor", () => {
    expect(
      expandRecurrence({
        anchorDate: "2026-05-01",
        from: "2026-01-01",
        rule: { interval: 1, unit: "day" },
        to: "2026-01-31",
      }),
    ).toEqual([])
  })

  test("returns nothing when the window starts after the until date", () => {
    expect(
      expandRecurrence({
        anchorDate: "2026-01-01",
        from: "2026-06-01",
        rule: { interval: 1, unit: "day" },
        to: "2026-06-30",
        until: "2026-02-01",
      }),
    ).toEqual([])
  })

  test("caps the occurrences returned for one rule in one request", () => {
    const occurrences = expandRecurrence({
      anchorDate: "2000-01-01",
      from: "2000-01-01",
      rule: { interval: 1, unit: "day" },
      to: "2100-01-01",
    })
    expect(occurrences).toHaveLength(1000)
  })
})

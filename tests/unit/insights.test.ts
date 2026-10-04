import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import nepal from "../../src/data/insights/nepal.json";
import business from "../../public/data/lucent-demo-summary.json";
import manifest from "../../src/data/insights/manifest.json";
import { matchesPeriod, planWater, sum } from "../../src/lib/insights";

describe("published insights evidence", () => {
  it("reconciles all districts and local levels to province and national census counts", () => {
    expect(nepal.districts).toHaveLength(77);
    expect(nepal.locals).toHaveLength(753);
    expect(sum(nepal.districts, (r) => r.population)).toBe(29164578);
    expect(sum(nepal.districts, (r) => r.households)).toBe(6660841);
    for (const p of nepal.provinces) {
      const districts = nepal.districts.filter(
        (d) => d.province === p.province,
      );
      expect(sum(districts, (d) => d.population)).toBe(p.population);
      for (let i = 0; i < 9; i++)
        expect(sum(districts, (d) => d.sources[i])).toBe(p.sources[i]);
    }
    for (const d of nepal.districts) {
      const locals = nepal.locals.filter((l) => l.district === d.district);
      expect(sum(locals, (l) => l.households)).toBe(d.households);
      // Preserve the official local/district population discrepancy.
      expect(sum(locals, (l) => l.population)).toBeLessThanOrEqual(
        d.population,
      );
      for (let i = 0; i < 9; i++)
        expect(sum(locals, (l) => l.sources[i])).toBe(d.sources[i]);
    }
    expect(sum(nepal.locals, (l) => l.population)).toBe(28925480);
  });
  it("keeps survey observations at their published geography and arsenic threshold", () => {
    expect(nepal.survey).toHaveLength(8);
    expect(nepal.survey[0].safelyManaged).toBe(47.3);
    expect(nepal.survey.find((r) => r.name === "Karnali")?.safelyManaged).toBe(
      21.9,
    );
    expect(nepal.districts.every((d) => !("safelyManaged" in d))).toBe(true);
    expect(sum(nepal.regions, (r) => r.households)).toBe(6660841);
    expect(sum(nepal.regions, (r) => r.population)).toBe(29164578);
  });
});

describe("synthetic business integrity", () => {
  it("reconciles downloadable orders with filtered chart revenue and product/channel totals", () => {
    const [header, ...lines] = readFileSync(
      "public/data/lucent-demo-orders.csv",
      "utf8",
    )
      .trim()
      .split(/\r?\n/);
    const keys = header.split(",");
    const orders = lines.map((line) =>
      Object.fromEntries(line.split(",").map((v, i) => [keys[i], v])),
    );
    expect(orders).toHaveLength(32892);
    expect(orders.every((r) => r.synthetic === "True")).toBe(true);
    const seen = new Set<string>();
    for (const order of orders) {
      expect(order.repeatOrder === "True").toBe(seen.has(order.customer));
      seen.add(order.customer);
    }
    for (const year of ["2023", "2024", "2025", "all"]) {
      for (const province of [0, 1, 2, 3, 4, 5, 6, 7]) {
        const ledger = orders.filter(
          (r) =>
            (year === "all" || r.date.startsWith(year)) &&
            (!province || Number(r.province) === province),
        );
        const summary = business.monthly.filter((r) =>
          matchesPeriod(r, year, province),
        );
        const expected = sum(ledger, (r) => Number(r.revenueNpr));
        expect(sum(summary, (r) => r.revenue)).toBe(expected);
        expect(sum(summary, (r) => r.orders)).toBe(ledger.length);
        expect(
          sum(
            business.productsMonthly.filter((r) =>
              matchesPeriod(r, year, province),
            ),
            (r) => r.revenue,
          ),
        ).toBe(expected);
        expect(
          sum(
            business.channelsMonthly.filter((r) =>
              matchesPeriod(r, year, province),
            ),
            (r) => r.revenue,
          ),
        ).toBe(expected);
      }
    }
    expect(manifest.syntheticRows).toBe(41754);
  });
  it("keeps funnel, delivery, service and station values internally possible", () => {
    expect(
      business.marketing.every(
        (r) => r.converted <= r.qualified && r.qualified <= r.leads,
      ),
    ).toBe(true);
    expect(
      business.distribution.every(
        (r) =>
          r.onTime <= r.delivered &&
          r.delivered <= r.shipments &&
          r.resolved <= r.serviceTickets,
      ),
    ).toBe(true);
    expect(
      business.atm.every(
        (r) => r.downtimeHours >= 0 && r.downtimeHours < r.operatingHours,
      ),
    ).toBe(true);
  });
});

describe("demand scenarios", () => {
  it("uses coverage and effective station capacity without interpreting survey safety as demand", () => {
    expect(
      planWater({
        population: 10000,
        litresPerPerson: 3,
        coveragePercent: 10,
        stationCapacity: 2000,
        uptimePercent: 90,
      }),
    ).toEqual({ totalLitres: 30000, targetLitres: 3000, stations: 2 });
    const scenario = planWater({
      population: 29164578,
      litresPerPerson: 3,
      coveragePercent: 10,
      stationCapacity: 2000,
      uptimePercent: 90,
    });
    expect(scenario.stations).toBe(4861);
    expect(scenario.targetLitres).toBeCloseTo(8749373.4);
  });
});

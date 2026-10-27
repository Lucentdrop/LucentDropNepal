import { describe, expect, it } from "vitest";
import { analytics } from "@/data/analytics";
import { analyticsSchema } from "@/lib/api/mappers";

describe("expanded analytics demo", () => {
  it("provides 36 aligned, finite monthly production and performance readings", () => {
    expect(analyticsSchema.parse(analytics)).toEqual(analytics);
    expect(analytics.months).toHaveLength(36);
    expect(new Set(analytics.months).size).toBe(36);
    expect(analytics.months[0]).toBe("Jan 2023");
    expect(analytics.months.at(-1)).toBe("Dec 2025");
    for (const series of [
      analytics.production,
      ...Object.values(analytics.performance),
    ]) {
      expect(series).toHaveLength(36);
      expect(series.every((value) => Number.isFinite(value) && value > 0)).toBe(
        true,
      );
    }
  });

  it("reconciles every province's system breakdown and the complete product mix", () => {
    expect(analytics.regions).toHaveLength(7);
    analytics.regions.forEach((_, i) => {
      const sum = analytics.installationTypes!.reduce(
        (total, type) => total + type.values[i],
        0,
      );
      expect(sum).toBe(analytics.installations[i]);
    });
    expect(analytics.categories).toHaveLength(8);
    expect(
      analytics.categories.reduce(
        (total, category) => total + category.value,
        0,
      ),
    ).toBe(100);
  });
});

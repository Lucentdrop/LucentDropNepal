export type PlanningInput = {
  population: number;
  litresPerPerson: number;
  coveragePercent: number;
  stationCapacity: number;
  uptimePercent: number;
};

/** Scenario demand only: does not measure unmet need or recommend a site. */
export function planWater(input: PlanningInput) {
  const totalLitres = input.population * input.litresPerPerson;
  const targetLitres = (totalLitres * input.coveragePercent) / 100;
  const effectiveCapacity = (input.stationCapacity * input.uptimePercent) / 100;
  return {
    totalLitres,
    targetLitres,
    stations:
      effectiveCapacity > 0 ? Math.ceil(targetLitres / effectiveCapacity) : 0,
  };
}

export function sum<T>(rows: T[], value: (row: T) => number) {
  return rows.reduce((total, row) => total + value(row), 0);
}

export function matchesPeriod(
  row: { month: string; province: number },
  year: string,
  province: number,
) {
  return (
    (year === "all" || row.month.startsWith(year)) &&
    (!province || row.province === province)
  );
}

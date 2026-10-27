import type { AnalyticsData } from "@/types";
// MOCK DATA ONLY: synthetic trends; not actual plant measurements or installation records.
// Fixed historical window makes this demo reproducible rather than inventing live readings.
const months = Array.from({ length: 36 }, (_, i) =>
  new Date(Date.UTC(2023, i, 1)).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }),
);
const seasonal = [0, 3, 8, 15, 20, 12, -5, -8, 4, 10, 5, 2];
const round = (value: number) => Math.round(value * 100) / 100;
export const analytics: AnalyticsData = {
  months,
  production: months.map((_, i) => round(84 + i * 2.8 + seasonal[i % 12])),
  regions: [
    "Bagmati",
    "Gandaki",
    "Lumbini",
    "Koshi",
    "Madhesh",
    "Karnali",
    "Sudurpashchim",
  ],
  installations: [145, 82, 76, 68, 54, 34, 41],
  installationTypes: [
    { name: "Treatment plants", values: [62, 29, 28, 25, 18, 9, 12] },
    { name: "Water ATMs", values: [35, 22, 20, 18, 19, 11, 13] },
    { name: "Filtration systems", values: [48, 31, 28, 25, 17, 14, 16] },
  ],
  categories: [
    { name: "RO treatment plants", value: 26 },
    { name: "Ultrafiltration", value: 16 },
    { name: "Water ATM", value: 18 },
    { name: "Storage", value: 12 },
    { name: "Media filtration", value: 10 },
    { name: "UV disinfection", value: 8 },
    { name: "Dosing systems", value: 6 },
    { name: "Spares & accessories", value: 4 },
  ],
  performance: {
    tds: months.map((_, i) =>
      round(48 - i * 0.35 + [2, -1, 3, 0, -2, 1][i % 6]),
    ),
    turbidity: months.map((_, i) =>
      round(0.86 - i * 0.011 + [0, 0.04, -0.02, 0.06][i % 4]),
    ),
    ph: months.map((_, i) => [7.1, 7.2, 7.15, 7.3, 7.25, 7.18][i % 6]),
    flow: months.map((_, i) =>
      round(11.8 + i * 0.065 + [0, 0.2, -0.1, 0.3][i % 4]),
    ),
  },
};

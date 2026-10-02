import type { AnalyticsData } from "@/types";
export const analytics: AnalyticsData = {
  months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
  production: [84, 92, 88, 108, 116, 128],
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
  categories: [
    { name: "Treatment plants", value: 42 },
    { name: "Filtration", value: 28 },
    { name: "Water ATM", value: 18 },
    { name: "Storage", value: 12 },
  ],
  performance: {
    tds: [44, 42, 39, 36, 38, 34],
    turbidity: [0.8, 0.7, 0.6, 0.5, 0.5, 0.4],
    ph: [7.1, 7.2, 7.1, 7.3, 7.2, 7.2],
    flow: [12, 12.4, 12.2, 12.8, 13, 13.1],
  },
};

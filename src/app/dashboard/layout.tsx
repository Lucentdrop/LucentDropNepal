import { DashboardShell } from "@/components/dashboard/dashboard-shell";
export const metadata = {
  title: "Member Dashboard",
  robots: { index: false, follow: false },
};
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}

import { UpdatesList } from "@/components/updates-list";
import { DashboardHeading } from "@/components/dashboard/dashboard-shell";
export default function MemberUpdates() {
  return (
    <>
      <DashboardHeading
        title="Latest Updates"
        description="Perspectives and insights from the world of water."
      />
      <UpdatesList />
    </>
  );
}

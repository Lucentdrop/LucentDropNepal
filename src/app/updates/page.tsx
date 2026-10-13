import { PageBanner } from "@/components/common";
import { UpdatesList } from "@/components/updates-list";
import { AnimatedLabel } from "@/components/animated-label";
export const metadata = { title: "Latest Updates" };
export default function UpdatesPage() {
  return (
    <>
      <PageBanner
        eyebrow={<AnimatedLabel kind="updates" />}
        title="Latest Updates"
        description="Moving Water Solutions Forward."
        image="/images/river.webp"
      />
      <section className="container section">
        <UpdatesList />
      </section>
    </>
  );
}

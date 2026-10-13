import { PageBanner } from "@/components/common";
import { UpdatesList } from "@/components/updates-list";
export const metadata = { title: "Latest Updates" };
export default function UpdatesPage() {
  return (
    <>
      <PageBanner
        eyebrow="What’s new"
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

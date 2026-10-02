import { PageBanner } from "@/components/common";
import { UpdatesList } from "@/components/updates-list";
export const metadata = { title: "Latest Updates" };
export default function UpdatesPage() {
  return (
    <>
      <PageBanner
        title="Latest Updates"
        description="Ideas, project perspectives and insights on water solutions and responsible resource use."
        image="/images/river.webp"
      />
      <section className="container section">
        <UpdatesList />
      </section>
    </>
  );
}

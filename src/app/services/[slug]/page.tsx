import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { services } from "@/data/services";
import { PageBanner } from "@/components/common";
import { Button } from "@/components/ui/button";
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: services.find((s) => s.slug === slug)?.name ?? "Service" };
}
export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();
  return (
    <>
      <PageBanner title={service.name} description={service.summary} />
      <section className="container section article">
        <div className="breadcrumbs">
          <Link href="/services">Services</Link>
          <span>/</span>
          <span>{service.name}</span>
        </div>
        <h2>A solution built around your needs</h2>
        <div className="article-content">
          <p>
            Every site has different water requirements. Start with a
            conversation about your source water, intended use, demand and
            location so the right approach can be identified.
          </p>
          <p>
            {service.summary} A site assessment and confirmed water analysis
            help shape the final scope, configuration and support plan.
          </p>
        </div>
        <ul className="feature-list">
          {[
            "Understand your project requirements",
            "Review source-water conditions and site constraints",
            "Develop a suitable scope and quotation",
            "Plan commissioning, training and ongoing care",
          ].map((f) => (
            <li key={f}>
              <CheckCircle2 size={16} />
              {f}
            </li>
          ))}
        </ul>
        <Button asChild className="mt-5">
          <Link href={`/contact?type=service`}>
            Discuss This Service <ArrowRight size={16} />
          </Link>
        </Button>
      </section>
    </>
  );
}

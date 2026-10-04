import Image from "@/components/ui/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageBanner, SectionHeading } from "@/components/common";
import { services } from "@/data/services";
export const metadata = { title: "Our Services" };
export default function ServicesPage() {
  return (
    <>
      <PageBanner
        title="Our Services"
        description="Comprehensive water solutions, from consultation and system selection to after-sales support."
      />
      <section className="container section">
        <SectionHeading
          eyebrow="Expertise at every step"
          title="Complete care for your water system"
          description="Find the right support for your business, institution or community."
        />
        <div className="service-page-grid">
          {services.map((s) => (
            <article className="service-large-card" key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="service-large-image block"
              >
                <Image
                  src={s.image}
                  alt={`Illustrative ${s.name}`}
                  fill
                  sizes="(max-width:600px) 90vw, 33vw"
                />
              </Link>
              <div className="service-large-body">
                <h3>{s.name}</h3>
                <p>{s.summary}</p>
                <Link className="text-link" href={`/services/${s.slug}`}>
                  Learn More <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

import Image from "next/image";
import { NepalMap } from "@/components/nepal-map";
import Link from "next/link";
import { Target, Eye, Heart, ArrowRight } from "lucide-react";
import { PageBanner, Stats, SectionHeading } from "@/components/common";
import { Button } from "@/components/ui/button";
export const metadata = { title: "About Us" };
const values = [
  {
    icon: Target,
    title: "Our Mission",
    text: "To make reliable, thoughtfully designed water solutions more accessible to businesses and communities in Nepal.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    text: "A healthier Nepal where water systems are dependable, sustainable and designed around real needs.",
  },
  {
    icon: Heart,
    title: "Our Values",
    text: "Innovation. Quality. Integrity. Sustainability. Community focus. These principles guide our approach.",
  },
];
export default function AboutPage() {
  return (
    <>
      <PageBanner
        title="About Lucent Drop Nepal"
        description="One-Stop Water Solution. A practical approach to better water for a brighter Nepal."
      />
      <section className="container section">
        <div className="about-intro">
          <div>
            <span className="eyebrow">Water connects us all</span>
            <h2>
              Better water.
              <br />
              <span>A brighter Nepal.</span>
            </h2>
            <p>
              Lucent Drop Nepal brings water treatment, processing and support
              together in one place. Our approach starts with understanding each
              site’s needs, then connecting the right solutions with practical
              long-term care.
            </p>
            <p>
              This prototype introduces the planned website experience. Product
              information, journey milestones and company statistics are
              illustrative until verified business details are supplied.
            </p>
          </div>
          <div className="about-image">
            <Image
              src="/images/hero.webp"
              alt="Illustrative Nepal water treatment landscape"
              fill
              sizes="(max-width:600px) 90vw, 45vw"
            />
          </div>
        </div>
        <div className="values-grid">
          {values.map((v) => (
            <div className="value-card" key={v.title}>
              <span className="soft-icon">
                <v.icon size={24} />
              </span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="updates-section">
        <div className="container section">
          <SectionHeading
            eyebrow="A connected approach"
            title="Our Journey"
            description="An illustrative roadmap from first assessment to long-term partnership."
          />
          <div className="timeline">
            {[
              ["Listen", "Understand your source water and requirements."],
              ["Design", "Select a suitable treatment approach."],
              ["Deliver", "Coordinate installation and commissioning."],
              ["Support", "Maintain dependable everyday operation."],
              ["Improve", "Review performance and plan ahead."],
            ].map(([title, text]) => (
              <div className="timeline-item" key={title}>
                <span className="timeline-dot" />
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="coverage-grid">
          <div className="nepal-map">
            <NepalMap />
            <p className="demo-caption">
              Nepal province boundaries · Service availability to be confirmed
            </p>
            <p className="map-attribution">
              Map: Survey Department of Nepal / OCHA FISS via{" "}
              <a
                href="https://www.geoboundaries.org/api/current/gbOpen/NPL/ADM1/"
                target="_blank"
                rel="noreferrer"
              >
                geoBoundaries
              </a>{" "}
              · 2020 boundary data ·{" "}
              <a
                href="https://creativecommons.org/licenses/by/3.0/igo/"
                target="_blank"
                rel="noreferrer"
              >
                CC BY 3.0 IGO
              </a>
            </p>
          </div>
          <div>
            <SectionHeading
              eyebrow="Closer to your needs"
              title="Service Coverage"
              description="Discuss your project location with our team to confirm service availability."
            />
            <div className="region-list">
              {[
                "Bagmati",
                "Gandaki",
                "Lumbini",
                "Koshi",
                "Madhesh",
                "Karnali",
                "Sudurpashchim",
              ].map((r) => (
                <span key={r}>{r}</span>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/contact">
                Discuss Your Location <ArrowRight size={15} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="container section" id="sustainability">
        <SectionHeading
          eyebrow="Every drop matters"
          title="Our Sustainability Approach"
          description="Responsible water use starts with careful design, suitable treatment and consistent maintenance."
        />
        <div className="values-grid">
          <div className="value-card">
            <h3>Conserve resources</h3>
            <p>
              Choose systems around actual water demand and consider recovery,
              reuse and efficient operation.
            </p>
          </div>
          <div className="value-card">
            <h3>Care for communities</h3>
            <p>
              Connect accessible solutions with testing, operator training and
              responsible maintenance.
            </p>
          </div>
          <div className="value-card">
            <h3>Plan for the long term</h3>
            <p>
              Design for serviceability and measure performance to support
              informed improvements.
            </p>
          </div>
        </div>
        <div style={{ marginTop: 30 }}>
          <Stats />
          <p className="demo-caption">
            Illustrative prototype statistics; no verified installation history
            is claimed.
          </p>
        </div>
      </section>
    </>
  );
}

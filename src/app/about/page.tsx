import Image from "@/components/ui/image";
import { NepalMap } from "@/components/nepal-map";
import Link from "next/link";
import { Target, Eye, Heart, ArrowRight } from "lucide-react";
import { PageBanner, Stats, SectionHeading } from "@/components/common";
import { Button } from "@/components/ui/button";
import { company } from "@/data/company";
export const metadata = { title: "About Us" };
const values = [
  {
    icon: Target,
    title: "Our Mission",
    text: company.mission,
  },
  {
    icon: Eye,
    title: "Our Vision",
    text: company.vision,
  },
];
export default function AboutPage() {
  return (
    <>
      <PageBanner
        eyebrow="Who we are"
        title="About Lucent Drop Nepal"
        description="We Don’t Just Treat Water. We Transform It."
      />
      <section className="container section">
        <div className="about-intro">
          <div>
            <span className="eyebrow">Established in 1999</span>
            <h2>
              Understanding water. <span>Creating lasting solutions.</span>
            </h2>
            {company.introduction.map((text) => (
              <p key={text}>{text}</p>
            ))}
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
        <div className="values-grid mission-grid">
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
        <div className="company-values-section">
          <SectionHeading eyebrow="What guides us" title="Our Core Values" />
          <div className="values-grid">
            {company.values.map((value) => (
              <article className="value-card" key={value.title}>
                <span className="soft-icon">
                  <Heart size={22} />
                </span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="company-team-section" id="team">
          <SectionHeading
            eyebrow="Working with you"
            title="Our Team"
            description="Dependable service starts with understanding your water challenges."
          />
          <p>
            We work with you to develop practical treatment solutions and
            support them through installation, maintenance and long-term
            technical service. Our approach is built on listening, partnership
            and shared responsibility for the solution.
          </p>
          <Button asChild variant="outline">
            <Link href="/contact">
              Talk to Our Team <ArrowRight size={15} />
            </Link>
          </Button>
        </div>
      </section>
      <section className="updates-section">
        <div className="container section">
          <SectionHeading
            eyebrow="Our Journey"
            title="Our Journey"
            description="From a Vision to a Movement for Better Water."
          />
          <div className="journey-copy">
            {company.journey.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
          <div className="timeline company-timeline">
            {company.journeyStages.map(({ title, text }) => (
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
        <NepalMap
          attribution={
            <>
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
            </>
          }
        >
          <div className="coverage-description">
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
        </NepalMap>
      </section>
      <section className="container section" id="sustainability">
        <SectionHeading
          eyebrow="Every drop matters"
          title="Our Sustainability Approach"
          description="Responsible water use starts with careful design, suitable treatment and consistent maintenance."
        />
        <div className="values-grid">
          {company.sustainability.map((item) => (
            <article className="value-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        <div style={{ marginTop: 30 }}>
          <Stats />
          <p className="demo-caption">
            Installation, region and satisfaction figures are illustrative;
            establishment year supplied by Lucent Drop Nepal.
          </p>
        </div>
      </section>
    </>
  );
}

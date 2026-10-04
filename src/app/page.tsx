import Link from "next/link";
import Image from "@/components/ui/image";
import {
  ArrowRight,
  ShieldCheck,
  Droplets,
  Leaf,
  HeartHandshake,
  Recycle,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Stats,
  SectionHeading,
  ProductCard,
  NewsCard,
} from "@/components/common";
import { products } from "@/data/products";
import { services, prototypeNotice } from "@/data/services";
import { updates } from "@/data/updates";
export default function Home() {
  return (
    <>
      <section className="home-hero">
        <Image
          className="hero-photo"
          src="/images/hero.webp"
          alt="Illustrative water treatment facility overlooking Kathmandu's green hills"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-wash" />
        <div className="container hero-content">
          <span className="eyebrow">
            <ShieldCheck size={15} /> Clean water. Healthy communities.
          </span>
          <h1>
            Smarter Water.
            <br />
            <span>Sustainable Future.</span>
          </h1>
          <p>
            Complete water processing and treatment solutions, built around your
            needs. Bringing together innovation, reliability and care for a
            brighter Nepal.
          </p>
          <div className="hero-buttons">
            <Button asChild>
              <Link href="/services">
                Explore Our Solutions <ArrowRight size={17} />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">
                Talk to an Expert <ArrowUpRight size={17} />
              </Link>
            </Button>
          </div>
          <div className="hero-assurance">
            <span>
              <ShieldCheck size={15} /> Thoughtful engineering
            </span>
            <span>
              <Droplets size={15} /> End-to-end support
            </span>
          </div>
        </div>
        <span className="hero-caption">
          Cleaner Water.
          <br />A Brighter Nepal.
        </span>
      </section>
      <div className="container stats-section">
        <Stats />
        <p className="demo-caption">Illustrative prototype statistics</p>
      </div>
      <section className="container section home-services">
        <SectionHeading
          eyebrow="Solutions for every need"
          title="Our Services"
          description="From the first conversation to long-term care, we’re with you at every step."
          link="View All Services"
          href="/services"
        />
        <div className="services-grid">
          {services.slice(0, 6).map((service) => (
            <Link
              className="service-card"
              href={`/services/${service.slug}`}
              key={service.slug}
            >
              <div className="service-image">
                <Image src={service.image} alt="" fill sizes="110px" />
              </div>
              <div>
                <h3>{service.name}</h3>
                <p>{service.summary}</p>
              </div>
              <span className="circle-arrow">
                <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="sustainability container">
        <Image
          src="/images/river.webp"
          alt="Illustrative river flowing through green Nepal hills"
          fill
          sizes="90vw"
        />
        <div className="sustainability-shade" />
        <div className="sustainability-copy">
          <span className="eyebrow">Every drop matters</span>
          <h2>
            Our Commitment to a<br />
            Sustainable Tomorrow
          </h2>
          <p>
            Thoughtful water solutions can help protect natural resources and
            support healthier communities. Let’s build a cleaner, greener Nepal
            together.
          </p>
          <Button asChild variant="outline">
            <Link href="/about#sustainability">
              Our Sustainability Approach <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
        <div className="sustainability-values">
          {[
            [Droplets, "Conserve", "Water Resources"],
            [Recycle, "Reduce", "Environmental Impact"],
            [HeartHandshake, "Support", "Healthier Communities"],
            [Leaf, "Innovate", "for a Greener Future"],
          ].map(([Icon, label, sub], i) => {
            const I = Icon as typeof Droplets;
            return (
              <div key={i}>
                <I size={29} />
                <strong>{label as string}</strong>
                <span>{sub as string}</span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="container section">
        <SectionHeading
          eyebrow="Engineered for your needs"
          title="Featured Products"
          description="Practical solutions. Dependable performance."
          link="View All Products"
          href="/products"
        />
        <div className="featured-grid">
          {products
            .filter((p) => p.featured)
            .map((product) => (
              <ProductCard product={product} compact key={product.id} />
            ))}
        </div>
        <div className="member-strip">
          <span>
            <ShieldCheck size={18} /> Looking for technical specifications and
            documents?
          </span>
          <Link href="/signup">
            Become a member <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <section className="updates-section">
        <div className="container section">
          <SectionHeading
            eyebrow="Knowledge & progress"
            title="Latest Updates"
            description="Ideas, insights and possibilities from the world of water."
            link="View All Updates"
            href="/updates"
          />
          <div className="news-grid">
            {updates.slice(0, 3).map((article) => (
              <NewsCard article={article} key={article.id} />
            ))}
          </div>
          <p className="demo-caption">{prototypeNotice}</p>
        </div>
      </section>
      <section className="container contact-strip">
        <div>
          <span className="eyebrow">Let’s find your solution</span>
          <h2>Better water starts with a conversation.</h2>
          <p>
            Tell us about your water needs. We’ll help you take the next step.
          </p>
        </div>
        <Button asChild>
          <Link href="/contact">
            Get in Touch <ArrowUpRight size={18} />
          </Link>
        </Button>
      </section>
    </>
  );
}

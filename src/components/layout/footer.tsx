import Link from "next/link";
import { Mail, MapPin, ArrowUpRight, Phone, Clock } from "lucide-react";
import Image from "@/components/ui/image";
import { company } from "@/data/company";
import { navigation } from "@/lib/constants/navigation";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="brand footer-brand">
            <Image
              className="brand-logo"
              src="/images/lucent-logo.png"
              alt="Lucent Drop Nepal company logo"
              width={40}
              height={61}
            />
            <span>
              <strong>Lucent Drop Nepal</strong>
              <small>One-Stop Water Solution</small>
            </span>
          </Link>
          <p>{company.tagline}</p>
          <span className="footer-note">
            Water purification and treatment solutions since 1999.
          </span>
        </div>
        <div>
          <h3>Quick Links</h3>
          {navigation.slice(1).map(([name, href]) => (
            <Link key={href} href={href}>
              {name}
            </Link>
          ))}
        </div>
        <div>
          <h3>Our Solutions</h3>
          {[
            "Water Treatment",
            "Industrial Solutions",
            "Water ATM",
            "Maintenance & AMC",
          ].map((name) => (
            <Link href="/services" key={name}>
              {name}
            </Link>
          ))}
        </div>
        <div>
          <h3>Get in Touch</h3>
          <p>
            <MapPin size={16} />{" "}
            <a href={company.contact.mapUrl} target="_blank" rel="noreferrer">
              {company.contact.address}
            </a>
          </p>
          <p>
            <Mail size={16} />{" "}
            <a href={`mailto:${company.contact.email}`}>
              {company.contact.email}
            </a>
          </p>
          <p>
            <Phone size={16} />
            <a href={company.contact.phoneHref}>{company.contact.phone}</a>
          </p>
          <p>
            <Clock size={16} />
            {company.contact.hours}
          </p>
          <Link className="footer-contact" href="/contact">
            Send an enquiry <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Lucent Drop Nepal Pvt. Ltd.</span>
        <Link href="/terms">Privacy & Terms</Link>
        <span>Clean water. Healthier communities.</span>
      </div>
    </footer>
  );
}

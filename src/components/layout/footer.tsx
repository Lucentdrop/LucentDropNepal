import Link from "next/link";
import { Mail, MapPin, ArrowUpRight, Droplets } from "lucide-react";
import { navigation } from "@/lib/constants/navigation";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="brand footer-brand">
            <span className="brand-mark">
              <Droplets />
            </span>
            <span>
              <strong>Lucent Drop Nepal</strong>
              <small>One-Stop Water Solution</small>
            </span>
          </Link>
          <p>
            Thoughtful water solutions for
            <br />a healthier and brighter Nepal.
          </p>
          <span className="footer-note">
            Prototype · Contact details to be confirmed
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
            <MapPin size={16} /> Kathmandu, Nepal{" "}
            <small>(illustrative location)</small>
          </p>
          <p>
            <Mail size={16} /> Contact details coming soon
          </p>
          <Link className="footer-contact" href="/contact">
            Send an enquiry <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} Lucent Drop Nepal. Prototype preview.
        </span>
        <Link href="/terms">Privacy & Terms</Link>
        <span>Clean water. Healthier communities.</span>
      </div>
    </footer>
  );
}

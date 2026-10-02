import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { PageBanner } from "@/components/common";
import { ContactForm } from "@/components/forms/contact-form";
export const metadata = { title: "Contact Us" };
export default function ContactPage() {
  return (
    <>
      <PageBanner
        title="Get in Touch"
        description="Tell us what you need. Let’s find a practical water solution together."
      />
      <section className="container section contact-grid">
        <div className="contact-info">
          <span className="eyebrow">We’re here to help</span>
          <h2 className="mt-2">Start a conversation</h2>
          <p>
            Have a question about products, services or a possible partnership?
            Share your requirements using the enquiry form.
          </p>
          {[
            {
              icon: MapPin,
              title: "Office",
              text: "Kathmandu, Nepal · Exact address to be confirmed",
            },
            {
              icon: Phone,
              title: "Phone",
              text: "Business phone number to be supplied",
            },
            {
              icon: Mail,
              title: "Email",
              text: "Business email address to be supplied",
            },
            {
              icon: Clock,
              title: "Business Hours",
              text: "Office hours to be confirmed",
            },
          ].map((c) => (
            <div className="contact-detail" key={c.title}>
              <span className="soft-icon">
                <c.icon size={17} />
              </span>
              <div>
                <strong>{c.title}</strong>
                <p>{c.text}</p>
              </div>
            </div>
          ))}
          <div className="map-placeholder">
            <svg viewBox="0 0 400 220" aria-hidden="true">
              <rect width="400" height="220" fill="#eef4f4" />
              {[30, 90, 150, 210, 270, 330].map((x) => (
                <path
                  key={x}
                  d={`M${x} 0L${x + 80} 220`}
                  stroke="white"
                  strokeWidth="11"
                />
              ))}
              {[30, 90, 150, 210].map((y) => (
                <path
                  key={y}
                  d={`M0 ${y}L400 ${y - 45}`}
                  stroke="#fff"
                  strokeWidth="9"
                />
              ))}
              <path
                d="M290 0Q200 50 255 110Q300 160 240 220"
                stroke="#b5dff2"
                strokeWidth="19"
                fill="none"
              />
            </svg>
            <div className="map-label">
              <MapPin />
              <strong>Kathmandu, Nepal</strong>
              <small>Map placeholder · No exact office pin</small>
            </div>
          </div>
        </div>
        <ContactForm />
      </section>
    </>
  );
}

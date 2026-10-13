import { MapPin, Mail, Phone, Clock, ArrowUpRight } from "lucide-react";
import { PageBanner } from "@/components/common";
import { ContactForm } from "@/components/forms/contact-form";
import { company } from "@/data/company";

export const metadata = { title: "Contact Us" };

export default function ContactPage() {
  const { contact } = company;
  return (
    <>
      <PageBanner
        eyebrow="Let’s connect"
        title="Get in Touch"
        description="Have a Water Challenge? Let’s Solve It Together."
      />
      <section className="container section contact-grid">
        <div className="contact-info">
          <span className="eyebrow">Welcome on-board</span>
          <h2 className="mt-2">Start a conversation</h2>
          <p>
            Have a question about products, services or a possible partnership?
            Call, email or share your requirements using the enquiry form.
          </p>
          {[
            {
              icon: MapPin,
              title: "Office",
              text: contact.address,
              href: contact.mapUrl,
            },
            {
              icon: Phone,
              title: "Phone",
              text: contact.phone,
              href: contact.phoneHref,
            },
            {
              icon: Mail,
              title: "Email",
              text: contact.email,
              href: "mailto:" + contact.email,
            },
            {
              icon: Clock,
              title: "Business Hours",
              text: contact.hours,
              href: null,
            },
          ].map((item) => (
            <div className="contact-detail" key={item.title}>
              <span className="soft-icon">
                <item.icon size={17} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.title === "Office" ? "_blank" : undefined}
                      rel={item.title === "Office" ? "noreferrer" : undefined}
                    >
                      {item.text}
                    </a>
                  ) : (
                    item.text
                  )}
                </p>
              </div>
            </div>
          ))}
          <div className="office-map">
            <iframe
              title="Lucent Drop Nepal office location in Setipakha"
              src={contact.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <a
            className="text-link office-directions"
            href={contact.mapUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open office location in Google Maps <ArrowUpRight size={16} />
          </a>
        </div>
        <ContactForm />
      </section>
    </>
  );
}

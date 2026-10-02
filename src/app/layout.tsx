import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Lucent Drop Nepal | One-Stop Water Solution",
    template: "%s | Lucent Drop Nepal",
  },
  description:
    "Explore water treatment, purification, dispensing and ongoing support for businesses and communities in Nepal. Local prototype preview.",
  openGraph: {
    title: "Lucent Drop Nepal",
    description: "Smarter Water. Sustainable Future.",
    images: ["/images/hero.webp"],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

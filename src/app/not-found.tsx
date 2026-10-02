import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <section className="container section empty-state">
      <span className="eyebrow">404</span>
      <h1 className="mt-3">Page not found</h1>
      <p>The page you’re looking for may have moved.</p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </section>
  );
}

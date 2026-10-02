"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="error-boundary">
      <h1>Something went wrong</h1>
      <p>Please try loading this page again.</p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}

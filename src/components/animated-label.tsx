import { ChevronRight } from "lucide-react";

export function AnimatedLabel({ kind }: { kind: "journal" | "updates" }) {
  return kind === "journal" ? (
    <span className="animated-label journal-label">
      <span className="journal-light" aria-hidden="true" />
      <span className="journal-title">The Water Journal</span>
    </span>
  ) : (
    <span className="animated-label updates-label">
      <span>What’s New</span>
      <span className="forward-trail" aria-hidden="true">
        <ChevronRight />
        <ChevronRight />
        <ChevronRight />
      </span>
    </span>
  );
}

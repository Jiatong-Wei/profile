import { ScrollText } from "lucide-react";

export const metadata = {
  title: "Papers",
  description: "Academic publications and preprints."
};

export default function PapersPage() {
  return (
    <div className="papers-empty">
      <div className="papers-icon-wrap" aria-hidden="true">
        <ScrollText size={40} strokeWidth={1.4} />
      </div>
      <h1 className="papers-title">Papers</h1>
      <p className="papers-subtitle">
        Research in progress — publications coming soon.
      </p>
      <p className="papers-note">
        I&apos;m currently building the foundation: engineering projects, competition
        results, and a growing wiki. Papers will follow.
      </p>
    </div>
  );
}

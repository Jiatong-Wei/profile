import Link from "next/link";
import { CalendarDays, ShieldCheck } from "lucide-react";
import { StatusBadge } from "./status-badge";
import type { ContentEntry } from "@/lib/types";

const collectionHref = {
  wiki: "/wiki",
  projects: "/projects",
  papers: "/papers"
};

export function ContentCard({ entry }: { entry: ContentEntry }) {
  const date =
    entry.meta.updated ??
    ("period" in entry.meta ? entry.meta.period : undefined) ??
    ("year" in entry.meta ? entry.meta.year : undefined);
  const href = `${collectionHref[entry.collection]}/${entry.slug}`;

  return (
    <article className={`content-card content-card-${entry.collection}`}>
      <div className="card-meta">
        <span>{entry.collection}</span>
        <StatusBadge status={entry.meta.status} />
        {entry.meta.humanCertified ? (
          <span className="human-cert-badge" title="Human-written, no AI generation">
            <ShieldCheck aria-hidden="true" size={12} />
            <span>Human Certified</span>
          </span>
        ) : null}
      </div>
      <h3>
        <Link href={href}>
          {entry.meta.title}
        </Link>
      </h3>
      <p>{entry.meta.summary}</p>
      <div className="card-foot">
        {date ? (
          <span className="date-line">
            <CalendarDays aria-hidden="true" size={15} />
            {date}
          </span>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}

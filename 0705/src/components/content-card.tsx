import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
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

  return (
    <article className={`content-card content-card-${entry.collection}`}>
      <div className="card-meta">
        <span>{entry.collection}</span>
        <StatusBadge status={entry.meta.status} />
      </div>
      <h3>
        <Link href={`${collectionHref[entry.collection]}/${entry.slug}`}>
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
        <Link className="icon-link" href={`${collectionHref[entry.collection]}/${entry.slug}`} aria-label={`Open ${entry.meta.title}`}>
          <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </article>
  );
}

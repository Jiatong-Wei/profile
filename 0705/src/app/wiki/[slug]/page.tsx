import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Backlinks } from "@/components/backlinks";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { StatusBadge } from "@/components/status-badge";
import { TagPill } from "@/components/tag-pill";
import { getEntriesByCollection, getWikiEntry } from "@/lib/content";
import type { WikiFrontmatter } from "@/lib/types";

export function generateStaticParams() {
  return getEntriesByCollection<WikiFrontmatter>("wiki").map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getWikiEntry(slug);

  if (!entry) {
    return {};
  }

  return {
    title: entry.meta.title,
    description: entry.meta.summary
  };
}

export default async function WikiDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getWikiEntry(slug);

  if (!entry) {
    notFound();
  }

  return (
    <article className="detail-layout">
      <header className="detail-hero">
        <p className="eyebrow">Wiki Note</p>
        <h1>{entry.meta.title}</h1>
        <p>{entry.meta.summary}</p>
        <div className="detail-meta">
          <StatusBadge status={entry.meta.status} />
          {entry.meta.updated ? <span>Updated {entry.meta.updated}</span> : null}
          {entry.meta.humanCertified ? (
            <span className="human-cert-badge" title="Human-written, no AI generation">
              <ShieldCheck aria-hidden="true" size={13} />
              <span>Human Certified</span>
            </span>
          ) : null}
        </div>
        <div className="tag-cloud">
          {(entry.meta.tags ?? []).map((tag) => (
            <TagPill tag={tag} key={tag} />
          ))}
        </div>
      </header>
      <div className="detail-grid">
        <MarkdownRenderer content={entry.body} />
        <aside>
          <Backlinks backlinks={entry.backlinks} />
        </aside>
      </div>
    </article>
  );
}

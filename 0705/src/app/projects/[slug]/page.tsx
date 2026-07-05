import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Backlinks } from "@/components/backlinks";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { StatusBadge } from "@/components/status-badge";
import { TagPill } from "@/components/tag-pill";
import { getEntriesByCollection, getEntry } from "@/lib/content";
import type { ProjectFrontmatter } from "@/lib/types";

export function generateStaticParams() {
  return getEntriesByCollection<ProjectFrontmatter>("projects").map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry("projects", slug);

  if (!entry) {
    return {};
  }

  return {
    title: entry.meta.title,
    description: entry.meta.summary
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getEntry("projects", slug);

  if (!entry) {
    notFound();
  }

  const meta = entry.meta as ProjectFrontmatter;

  return (
    <article className="detail-layout">
      <header className="detail-hero project-hero">
        <p className="eyebrow">Project</p>
        <h1>{meta.title}</h1>
        <p>{meta.summary}</p>
        <div className="detail-meta">
          <StatusBadge status={meta.status} />
          {meta.role ? <span>{meta.role}</span> : null}
          {meta.period ? <span>{meta.period}</span> : null}
        </div>
        <div className="tag-cloud">
          {(meta.tags ?? []).map((tag) => (
            <TagPill tag={tag} key={tag} />
          ))}
        </div>
        {meta.links?.length ? (
          <div className="detail-links">
            {meta.links.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
                <ExternalLink aria-hidden="true" size={15} />
              </Link>
            ))}
          </div>
        ) : null}
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

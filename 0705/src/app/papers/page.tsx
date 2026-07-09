import { ScrollText } from "lucide-react";
import { ContentCard } from "@/components/content-card";
import { PageHero } from "@/components/page-hero";
import { getEntriesByCollection } from "@/lib/content";
import type { PaperFrontmatter } from "@/lib/types";

export const metadata = {
  title: "Papers",
  description: "Academic publications, preprints and reading notes."
};

export default function PapersPage() {
  const papers = getEntriesByCollection<PaperFrontmatter>("papers");

  if (papers.length === 0) {
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

  return (
    <>
      <PageHero
        eyebrow="Papers"
        title="论文、预印本与研究笔记"
        summary="正式发表的论文、进行中的写作、以及作为 paper 种子的研究笔记。"
      />
      <section className="section-band">
        <div className="card-grid">
          {papers.map((paper) => (
            <ContentCard entry={paper} key={paper.slug} />
          ))}
        </div>
      </section>
    </>
  );
}

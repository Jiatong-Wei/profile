import { ContentCard } from "@/components/content-card";
import { PageHero } from "@/components/page-hero";
import { getEntriesByCollection } from "@/lib/content";
import type { PaperFrontmatter } from "@/lib/types";

export const metadata = {
  title: "Papers",
  description: "论文、研究笔记、预印本和阅读路线。"
};

export default function PapersPage() {
  const papers = getEntriesByCollection<PaperFrontmatter>("papers");

  return (
    <>
      <PageHero
        eyebrow="Papers"
        title="论文与研究笔记"
        summary="这里暂时以研究笔记和 working notes 为主；正式论文会继续补充 BibTeX、链接和项目关联。"
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

import type { Metadata } from "next";
import { ContentCard } from "@/components/content-card";
import { PageHero } from "@/components/page-hero";
import { getAllTags, getEntriesByTag } from "@/lib/content";

export function generateStaticParams() {
  return getAllTags().map((item) => ({ tag: item.tag }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);

  return {
    title: `Tag: ${decoded}`,
    description: `Content tagged with ${decoded}`
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const entries = getEntriesByTag(decoded);

  return (
    <>
      <PageHero
        eyebrow="Tag"
        title={decoded}
        summary={`与 “${decoded}” 相关的公开笔记、项目和研究条目。`}
      />
      <section className="section-band">
        <div className="card-grid">
          {entries.map((entry) => (
            <ContentCard entry={entry} key={`${entry.collection}-${entry.slug}`} />
          ))}
        </div>
      </section>
    </>
  );
}

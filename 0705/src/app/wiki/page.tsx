import { ContentCard } from "@/components/content-card";
import { KnowledgeGraph } from "@/components/knowledge-graph";
import { PageHero } from "@/components/page-hero";
import { WikiSearch } from "@/components/wiki-search";
import { buildGraph, getEntriesByCollection } from "@/lib/content";
import type { WikiFrontmatter } from "@/lib/types";

export const metadata = {
  title: "Wiki",
  description: "公开的个人知识库、Obsidian 双链笔记与研究问题。"
};

export default function WikiPage() {
  const notes = getEntriesByCollection<WikiFrontmatter>("wiki");
  const graph = buildGraph(notes);

  return (
    <>
      <PageHero
        eyebrow="Personal Wiki"
        title="公开知识库"
        summary="这里放的是可以被访问者自由进入的笔记：概念、项目经验、研究问题和后续 paper 的种子。"
      />
      <section className="section-band wiki-dashboard">
        <WikiSearch
          items={notes.map((note) => ({
            slug: note.slug,
            title: note.meta.title,
            summary: note.meta.summary,
            tags: note.meta.tags ?? []
          }))}
        />
        <KnowledgeGraph nodes={graph.nodes} edges={graph.edges} />
      </section>
      <section className="section-band">
        <div className="section-heading">
          <p className="eyebrow">Notes</p>
          <h2>当前公开笔记</h2>
        </div>
        <div className="card-grid">
          {notes.map((note) => (
            <ContentCard entry={note} key={note.slug} />
          ))}
        </div>
      </section>
    </>
  );
}

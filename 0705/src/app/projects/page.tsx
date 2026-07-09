import { ContentCard } from "@/components/content-card";
import { PageHero } from "@/components/page-hero";
import { getEntriesByCollection } from "@/lib/content";
import type { ProjectFrontmatter } from "@/lib/types";

export const metadata = {
  title: "Projects",
  description: "代表性工程项目、竞赛项目和证据材料。"
};

// Preferred display order for projects — any project not listed here still
// appears, sorted by date, after the ordered ones.
const preferredOrder = [
  "intelligent-logistics-robot",
  "rotary-underwater-vehicle",
  "omni-wheel-transport-platform",
  "integrated-underwater-platform",
  "vector-pump-underwater-vehicle",
  "digital-agriculture-simulation"
];

export default function ProjectsPage() {
  const all = getEntriesByCollection<ProjectFrontmatter>("projects");
  const bySlug = new Map(all.map((entry) => [entry.slug, entry]));
  const ordered = preferredOrder
    .map((slug) => bySlug.get(slug))
    .filter((entry): entry is (typeof all)[number] => Boolean(entry));
  const rest = all.filter((entry) => !preferredOrder.includes(entry.slug));
  const projects = [...ordered, ...rest];

  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="项目不是奖项列表，而是可追踪的工程证据"
        summary="每个项目页都会尽量回答：问题是什么、我负责什么、做出了什么、和哪些知识节点有关。"
      />
      <section className="section-band">
        <div className="card-grid">
          {projects.map((project) => (
            <ContentCard entry={project} key={project.slug} />
          ))}
        </div>
      </section>
    </>
  );
}

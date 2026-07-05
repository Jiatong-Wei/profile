import { ContentCard } from "@/components/content-card";
import { PageHero } from "@/components/page-hero";
import { getEntry } from "@/lib/content";
import type { ContentEntry, ProjectFrontmatter } from "@/lib/types";

export const metadata = {
  title: "Projects",
  description: "代表性工程项目、竞赛项目和证据材料。"
};

const projectOrder = [
  "intelligent-logistics-robot",
  "rotary-underwater-vehicle",
  "omni-wheel-transport-platform"
];

function isProjectEntry(entry: ContentEntry | undefined): entry is ContentEntry<ProjectFrontmatter> {
  return Boolean(entry);
}

export default function ProjectsPage() {
  const projects = projectOrder.map((slug) => getEntry("projects", slug)).filter(isProjectEntry);

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

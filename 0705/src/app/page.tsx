import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Network } from "lucide-react";
import { ContentCard } from "@/components/content-card";
import { KnowledgeGraph } from "@/components/knowledge-graph";
import { TagPill } from "@/components/tag-pill";
import { buildGraph, getAllTags, getFeaturedEntries } from "@/lib/content";
import { contactItems, focusAreas, homepageLanes, SITE } from "@/lib/site";

export default function HomePage() {
  const graph = buildGraph();
  const featured = getFeaturedEntries(undefined, 6);
  const tags = getAllTags().slice(0, 10);

  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Personal Wiki · Papers · Projects</p>
          <h1>{SITE.name}</h1>
          <p className="hero-lead">
            我正在把水下机器人、具身智能、强化学习和工程实践连接成一个可追踪的个人知识系统。
          </p>
          <div className="focus-strip" aria-label="Research focus areas">
            {focusAreas.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="hero-actions">
            <Link className="primary-action" href="/wiki">
              <BookOpen aria-hidden="true" size={18} />
              Explore Wiki
            </Link>
            <Link className="secondary-action" href="/cv">
              <FileText aria-hidden="true" size={18} />
              View CV
            </Link>
          </div>
        </div>
        <div className="hero-map-shell">
          <div className="portrait-chip">
            <Image src={SITE.avatar} alt="Jiatong Wei portrait" width={76} height={76} priority />
            <span>
              <strong>Undergraduate Researcher</strong>
              <small>{SITE.institution}</small>
            </span>
          </div>
          <KnowledgeGraph nodes={graph.nodes} edges={graph.edges} compact />
        </div>
      </section>

      <section className="quick-lanes">
        {homepageLanes.map((lane) => {
          const Icon = lane.icon;

          return (
            <Link className="lane-card" href={lane.href} key={lane.href}>
              <Icon aria-hidden="true" size={22} />
              <span>
                <strong>{lane.title}</strong>
                <small>{lane.description}</small>
              </span>
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          );
        })}
      </section>

      <section className="section-band section-bright">
        <div className="section-heading">
          <p className="eyebrow">Featured</p>
          <h2>从工程现场生长出来的知识节点</h2>
          <p>
            首页只放入口和摘要；更完整的证据、过程、技术细节和研究问题放进对应页面。
          </p>
        </div>
        <div className="card-grid">
          {featured.map((entry) => (
            <ContentCard entry={entry} key={`${entry.collection}-${entry.slug}`} />
          ))}
        </div>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Tags</p>
          <h2>可以从这些线索进入</h2>
          <div className="tag-cloud">
            {tags.map((item) => (
              <TagPill tag={item.tag} count={item.count} key={item.tag} />
            ))}
          </div>
        </div>
        <div className="contact-panel">
          <p className="eyebrow">Contact</p>
          {contactItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link href={item.href} key={item.href}>
                <Icon aria-hidden="true" size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Link className="inline-next" href="/projects">
            See project evidence <Network aria-hidden="true" size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}

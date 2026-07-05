import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Download, Github, Mail, MapPin } from "lucide-react";
import { getEntry } from "@/lib/content";
import { contactItems, focusAreas, SITE, withBasePath } from "@/lib/site";
import type { ContentEntry, ProjectFrontmatter } from "@/lib/types";

const representativeProjectSlugs = [
  "intelligent-logistics-robot",
  "rotary-underwater-vehicle",
  "omni-wheel-transport-platform"
];

function isProjectEntry(entry: ContentEntry | undefined): entry is ContentEntry<ProjectFrontmatter> {
  return Boolean(entry);
}

export default function HomePage() {
  const projects = representativeProjectSlugs
    .map((slug) => getEntry("projects", slug))
    .filter(isProjectEntry);

  const mail = contactItems.find((item) => item.href.startsWith("mailto:"));
  const github = contactItems.find((item) => item.href.startsWith("https://github.com"));
  const location = contactItems.find((item) => item.label === SITE.location);

  return (
    <section className="home-one-screen">
      <div className="profile-panel">
        <div className="profile-portrait-frame">
          <Image
            src={SITE.avatar}
            alt="Jiatong Wei portrait"
            width={420}
            height={560}
            priority
            className="profile-portrait"
          />
        </div>
        <div className="profile-copy">
          <p className="eyebrow">Personal Profile</p>
          <h1>{SITE.name}</h1>
          <p>
            Undergraduate researcher at {SITE.institution}, focused on robotics,
            underwater unmanned systems, and embodied AI.
          </p>
          <div className="focus-strip" aria-label="Research focus areas">
            {focusAreas.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="profile-actions">
            <a className="primary-action" href={withBasePath(SITE.cvPdf)} download>
              <Download aria-hidden="true" size={18} />
              Download CV
            </a>
            <Link className="secondary-action" href="/projects">
              <ArrowUpRight aria-hidden="true" size={18} />
              View Projects
            </Link>
          </div>
          <div className="profile-contact">
            {mail ? (
              <a href={mail.href}>
                <Mail aria-hidden="true" size={15} />
                <span>{mail.label}</span>
              </a>
            ) : null}
            {github ? (
              <a href={github.href}>
                <Github aria-hidden="true" size={15} />
                <span>{github.label}</span>
              </a>
            ) : null}
            {location ? (
              <a href={location.href}>
                <MapPin aria-hidden="true" size={15} />
                <span>{location.label}</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <aside className="work-panel">
        <div className="section-heading compact-heading">
          <p className="eyebrow">Representative Work</p>
          <h2>工程项目与研究方向的交汇点</h2>
          <p>
            首页先保留最能说明能力路径的三项：底盘控制、水下航行器全栈实现、智能运输平台。
          </p>
        </div>
        <div className="work-list">
          {projects.map((project) => {
            const meta = project.meta as ProjectFrontmatter;

            return (
              <Link className="work-item" href={`/projects/${project.slug}`} key={project.slug}>
                <span>
                  <strong>{meta.title}</strong>
                  <small>{meta.role ?? "Project"} · {meta.period ?? "Ongoing"}</small>
                </span>
                <ArrowUpRight aria-hidden="true" size={18} />
              </Link>
            );
          })}
        </div>
        <div className="detail-note">
          <p className="eyebrow">Current Focus</p>
          <p>
            I am organizing my engineering evidence into a public wiki: what I built,
            what failed, and which questions may later become research problems.
          </p>
        </div>
      </aside>
    </section>
  );
}

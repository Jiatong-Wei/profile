import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Download, Github, Mail, MapPin } from "lucide-react";
import { contactItems, focusAreas, SITE, withBasePath } from "@/lib/site";

const evidenceItems = [
  {
    period: "2023.09 - Present",
    title: "B.Eng. Underwater Acoustics",
    detail: "Northwestern Polytechnical University · Avg. 85/100",
    type: "Education"
  },
  {
    period: "2025.08",
    title: "National Grand Prize",
    detail:
      "14th National Ocean Navigation Vehicle Competition · Integrated Underwater Inspection Platform",
    type: "Award"
  },
  {
    period: "2025.07",
    title: "Regional First Prize",
    detail:
      "14th ONVDC Northwest Regional · Rotary Underwater Vehicle, sole contributor",
    type: "Award"
  },
  {
    period: "2025.04",
    title: "Provincial First Prize",
    detail:
      "China College Engineering Practice & Innovation Competition · Intelligent Logistics Robot",
    type: "Award"
  }
];

export default function HomePage() {
  const mail = contactItems.find((c) => c.href.startsWith("mailto:"));
  const github = contactItems.find((c) => c.href.startsWith("https://github.com"));
  const location = contactItems.find((c) => c.label === SITE.location);

  return (
    <section className="home-one-screen">
      <aside className="profile-panel" aria-label="Academic profile card">
        <div className="profile-card-top">
          <div className="profile-portrait-frame">
            <Image
              src={SITE.avatar}
              alt="Cartoon beagle academic avatar"
              fill
              priority
              className="profile-portrait"
              sizes="(max-width: 720px) 42vw, 160px"
            />
          </div>

          <div className="profile-copy">
            <p className="profile-kicker">Academic Profile</p>
            <h1>{SITE.shortName}</h1>
            <p className="profile-role">Undergraduate Researcher</p>
            <p className="profile-tagline">
              {SITE.institution}
              <br />
              Underwater Acoustics · Robotics Systems
            </p>
          </div>
        </div>

        <p className="profile-statement">
          I build inspectable robot systems for embodied intelligence and
          underwater unmanned platforms.
        </p>

        <div className="profile-contact" aria-label="Contact links">
          {mail ? (
            <a href={mail.href}>
              <Mail aria-hidden="true" size={16} />
              <span>Email</span>
            </a>
          ) : null}
          {github ? (
            <a href={github.href} target="_blank" rel="noreferrer">
              <Github aria-hidden="true" size={16} />
              <span>GitHub</span>
            </a>
          ) : null}
          {location ? (
            <a href={location.href}>
              <MapPin aria-hidden="true" size={16} />
              <span>{location.label}</span>
            </a>
          ) : null}
        </div>

        <div className="profile-actions">
          <a className="primary-action" href={withBasePath(SITE.cvPdf)} download>
            <Download aria-hidden="true" size={16} />
            Download CV
          </a>
          <Link className="secondary-action" href="/projects">
            <ArrowUpRight aria-hidden="true" size={16} />
            View Projects
          </Link>
        </div>

        <section className="focus-strip" aria-label="Research focus areas">
          <h2>Research Focus</h2>
          <div>
            {focusAreas.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>
      </aside>

      <aside className="work-panel resume-panel" aria-label="Resume summary">
        <section className="about-section resume-section">
          <p className="eyebrow">About</p>
          <h2 className="about-heading">面向真实系统的机器人与水下智能</h2>
          <p className="about-lead">
            我是魏佳桐，来自西北工业大学水声工程学院（2023-2027）。目前关注
            <strong>具身智能</strong>、<strong>水下无人系统</strong>与可落地的机器人全栈工程。
          </p>
          <p className="about-body">
            这个网站会逐步沉淀我的项目、竞赛、工程决策和失败记录。首页只保留最能支持
            学术申请与求职判断的信息：教育背景、代表性项目、奖项证据和可追溯的个人 Wiki。
          </p>
        </section>

        <section className="experience-section resume-section">
          <div className="resume-section-heading">
            <p className="eyebrow">Evidence</p>
            <Link href="/projects">
              Projects
              <ArrowUpRight aria-hidden="true" size={15} />
            </Link>
          </div>

          <ol className="evidence-list" aria-label="Education and selected evidence">
            {evidenceItems.map((item) => (
              <li className="evidence-item" key={`${item.period}-${item.title}`}>
                <span className="evidence-period">{item.period}</span>
                <div>
                  <span className="evidence-type">{item.type}</span>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </aside>
    </section>
  );
}

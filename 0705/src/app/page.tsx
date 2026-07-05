import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Download, Github, Mail, MapPin } from "lucide-react";
import { contactItems, focusAreas, SITE, withBasePath } from "@/lib/site";

export default function HomePage() {
  const mail     = contactItems.find((c) => c.href.startsWith("mailto:"));
  const github   = contactItems.find((c) => c.href.startsWith("https://github.com"));
  const location = contactItems.find((c) => c.label === SITE.location);

  return (
    <section className="home-one-screen">

      {/* ─── Left: Profile ─── */}
      <div className="profile-panel">

        {/* Portrait — contain, no cropping */}
        <div className="profile-portrait-frame">
          <Image
            src={SITE.avatar}
            alt="Jiatong Wei portrait"
            fill
            priority
            className="profile-portrait"
            sizes="(max-width: 720px) 90vw, 420px"
          />
        </div>

        {/* Name block */}
        <div className="profile-copy">
          <p className="eyebrow">Personal Profile</p>
          <h1>{SITE.name}</h1>
          <p className="profile-tagline">
            Undergraduate&nbsp;·&nbsp;{SITE.institution}
            <br />Marine Science &amp; Technology
          </p>
          <div className="focus-strip" aria-label="Research focus areas">
            {focusAreas.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="profile-contact">
          {mail && (
            <a href={mail.href}>
              <Mail aria-hidden="true" size={14} />
              <span>{mail.label}</span>
            </a>
          )}
          {github && (
            <a href={github.href} target="_blank" rel="noreferrer">
              <Github aria-hidden="true" size={14} />
              <span>GitHub</span>
            </a>
          )}
          {location && (
            <span className="profile-location-tag">
              <MapPin aria-hidden="true" size={14} />
              <span>{location.label}</span>
            </span>
          )}
        </div>

        {/* Actions */}
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

      </div>

      {/* ─── Right: Bio + Experience ─── */}
      <aside className="work-panel">

        {/* About Me */}
        <div className="about-section">
          <p className="eyebrow">About Me</p>
          <h2 className="about-heading">机器人与海洋的交叉地带</h2>
          <p className="about-lead">
            我是魏佳桐，来自西北工业大学水声工程学院（2023–2027）。
            研究方向聚焦于<strong>具身智能</strong>与<strong>水下无人系统</strong>，
            热衷于将强化学习落地为可以实际运动的硬件系统。
          </p>
          <p className="about-body">
            我正在将每一个工程项目的设计决策、失败与突破系统化地记录进
            Personal Wiki，希望未来能在具身智能领域做出有实质贡献的研究工作。
          </p>
        </div>

        {/* Experience timeline */}
        <div className="experience-section">
          <p className="eyebrow">Experience</p>
          <ol className="timeline" aria-label="Experience timeline">

            <li className="tl-item">
              <span className="tl-dot tl-edu" aria-hidden="true" />
              <div className="tl-body">
                <time className="tl-period">2023.09 – present</time>
                <strong className="tl-title">B.Eng. Underwater Acoustics</strong>
                <span className="tl-sub">
                  Northwestern Polytechnical University · Avg.&nbsp;85/100
                </span>
              </div>
            </li>

            <li className="tl-item">
              <span className="tl-dot tl-award" aria-hidden="true" />
              <div className="tl-body">
                <time className="tl-period">2025.08</time>
                <strong className="tl-title">National Grand Prize 🏆</strong>
                <span className="tl-sub">
                  14th National Ocean Navigation Vehicle Competition — Integrated Underwater Inspection Platform
                </span>
              </div>
            </li>

            <li className="tl-item">
              <span className="tl-dot tl-award" aria-hidden="true" />
              <div className="tl-body">
                <time className="tl-period">2025.07</time>
                <strong className="tl-title">Regional First Prize 🥇</strong>
                <span className="tl-sub">
                  14th ONVDC Northwest Regional — Rotary Underwater Vehicle&nbsp;(sole contributor)
                </span>
              </div>
            </li>

            <li className="tl-item">
              <span className="tl-dot tl-award" aria-hidden="true" />
              <div className="tl-body">
                <time className="tl-period">2025.04</time>
                <strong className="tl-title">Provincial First Prize 🥇</strong>
                <span className="tl-sub">
                  China College Engineering Practice &amp; Innovation Competition — Intelligent Logistics Robot
                </span>
              </div>
            </li>

          </ol>
        </div>

      </aside>
    </section>
  );
}

import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  summary: string;
  children?: ReactNode;
}

export function PageHero({ eyebrow, title, summary, children }: PageHeroProps) {
  return (
    <section className="page-hero">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{summary}</p>
      {children ? <div className="page-hero-actions">{children}</div> : null}
    </section>
  );
}

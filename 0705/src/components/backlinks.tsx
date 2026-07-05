import Link from "next/link";
import { CornerUpLeft } from "lucide-react";
import type { Backlink } from "@/lib/types";

const collectionHref = {
  wiki: "/wiki",
  projects: "/projects",
  papers: "/papers"
};

export function Backlinks({ backlinks }: { backlinks: Backlink[] }) {
  if (backlinks.length === 0) {
    return (
      <section className="reference-panel">
        <h2>Backlinks</h2>
        <p>暂时还没有公开笔记链接到这里。</p>
      </section>
    );
  }

  return (
    <section className="reference-panel">
      <h2>Backlinks</h2>
      <div className="backlink-list">
        {backlinks.map((item) => (
          <Link href={`${collectionHref[item.collection]}/${item.slug}`} key={`${item.collection}-${item.slug}`}>
            <CornerUpLeft aria-hidden="true" size={16} />
            <span>
              <strong>{item.title}</strong>
              <small>{item.summary}</small>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

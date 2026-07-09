"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

interface SearchItem {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  collection?: string;
}

export function WikiSearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalizedQuery) {
      return items.slice(0, 6);
    }

    return items
      .filter((item) => {
        const haystack = [item.title, item.summary, ...item.tags].join(" ").toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [items, normalizedQuery]);

  return (
    <section className="search-panel" aria-label="Wiki search">
      <label htmlFor="wiki-search">
        <Search aria-hidden="true" size={18} />
        <span>Search public notes</span>
      </label>
      <input
        id="wiki-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search topics, tags, projects..."
      />
      <div className="search-results">
        {results.map((item) => (
          <Link
            href={`/${item.collection ?? "wiki"}/${item.slug}`}
            key={`${item.collection ?? "wiki"}-${item.slug}`}
          >
            <strong>{item.title}</strong>
            <span>{item.summary}</span>
          </Link>
        ))}
        {results.length === 0 ? <p>No public notes matched.</p> : null}
      </div>
    </section>
  );
}

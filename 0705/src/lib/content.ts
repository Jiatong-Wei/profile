import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  Backlink,
  Collection,
  ContentEntry,
  Frontmatter,
  GraphEdge,
  GraphNode,
  WikiLink
} from "./types";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const markdownExtensions = new Set([".md", ".mdx"]);

function normalizeSlug(value: string): string {
  return value
    .trim()
    .replace(/\\/g, "/")
    .replace(/\.(md|mdx)$/i, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function collectionDir(collection: Collection): string {
  return path.join(CONTENT_ROOT, collection);
}

function readFilesRecursive(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return readFilesRecursive(fullPath);
      }

      if (entry.isFile() && markdownExtensions.has(path.extname(entry.name))) {
        return [fullPath];
      }

      return [];
    })
    .sort((a, b) => a.localeCompare(b));
}

export function extractWikiLinks(body: string): WikiLink[] {
  const links: WikiLink[] = [];
  const wikiLinkPattern = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g;
  let match: RegExpExecArray | null;

  while ((match = wikiLinkPattern.exec(body)) !== null) {
    const target = normalizeSlug(match[1]);
    const alias = match[2]?.trim();

    if (target) {
      links.push({
        target,
        alias,
        raw: match[0]
      });
    }
  }

  return links;
}

function coerceFrontmatter(collection: Collection, data: Record<string, unknown>): Frontmatter {
  return {
    title: String(data.title ?? "Untitled"),
    summary: String(data.summary ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    updated: formatFrontmatterValue(data.updated),
    publish: data.publish === true,
    status: data.status ? String(data.status) as Frontmatter["status"] : undefined,
    aliases: Array.isArray(data.aliases) ? data.aliases.map(String) : [],
    featured: data.featured === true,
    humanCertified: data.humanCertified === true || data.human_certified === true,
    related: Array.isArray(data.related) ? data.related.map((item) => normalizeSlug(String(item))) : [],
    area: collection === "wiki" && data.area ? String(data.area) : undefined,
    role: collection === "projects" && data.role ? String(data.role) : undefined,
    period: collection === "projects" ? formatFrontmatterValue(data.period) : undefined,
    cover: collection === "projects" && data.cover ? String(data.cover) : undefined,
    authors: collection === "papers" && Array.isArray(data.authors) ? data.authors.map(String) : undefined,
    venue: collection === "papers" && data.venue ? String(data.venue) : undefined,
    year: collection === "papers" ? formatFrontmatterValue(data.year) : undefined,
    bibtexKey: collection === "papers" && data.bibtexKey ? String(data.bibtexKey) : undefined,
    links: Array.isArray(data.links)
      ? data.links
          .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
          .map((item) => ({
            label: String(item.label ?? "Link"),
            href: String(item.href ?? "#")
          }))
      : undefined
  };
}

function readCollection(collection: Collection): ContentEntry[] {
  const dir = collectionDir(collection);

  return readFilesRecursive(dir).map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = matter(raw);
    const relativePath = path.relative(dir, filePath);
    const slug = normalizeSlug(relativePath);
    const body = parsed.content.trim();

    return {
      collection,
      slug,
      path: filePath,
      body,
      rawBody: raw,
      links: extractWikiLinks(body),
      backlinks: [],
      meta: coerceFrontmatter(collection, parsed.data)
    };
  });
}

export function getAllEntries(includeDrafts = false): ContentEntry[] {
  const entries = (["wiki", "projects", "papers"] as Collection[])
    .flatMap((collection) => readCollection(collection))
    .filter((entry) => includeDrafts || entry.meta.publish === true);

  return attachBacklinks(entries);
}

export function getEntriesByCollection<T extends Frontmatter>(
  collection: Collection,
  includeDrafts = false
): ContentEntry<T>[] {
  return getAllEntries(includeDrafts)
    .filter((entry) => entry.collection === collection)
    .sort(sortByDate)
    .map((entry) => entry as ContentEntry<T>);
}

export function getEntry(collection: Collection, slug: string): ContentEntry | undefined {
  return getAllEntries().find(
    (entry) => entry.collection === collection && entry.slug === normalizeSlug(slug)
  );
}

export function getWikiEntry(slug: string): ContentEntry | undefined {
  const normalized = normalizeSlug(slug);
  const entries = getAllEntries();
  const aliasTarget = entries.find((entry) => {
    if (entry.collection !== "wiki") {
      return false;
    }

    return [entry.slug, entry.meta.title, ...(entry.meta.aliases ?? [])]
      .map(normalizeSlug)
      .includes(normalized);
  });

  return aliasTarget;
}

export function getFeaturedEntries(collection?: Collection, limit = 4): ContentEntry[] {
  return getAllEntries()
    .filter((entry) => (!collection || entry.collection === collection) && entry.meta.featured)
    .sort(sortByDate)
    .slice(0, limit);
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const entry of getAllEntries()) {
    for (const tag of entry.meta.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}

export function getEntriesByTag(tag: string): ContentEntry[] {
  return getAllEntries()
    .filter((entry) => (entry.meta.tags ?? []).includes(tag))
    .sort(sortByDate);
}

export function buildGraph(entries = getAllEntries()): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodeIds = new Set(entries.map((entry) => entry.slug));
  const nodes = entries.map((entry) => ({
    id: entry.slug,
    title: entry.meta.title,
    collection: entry.collection,
    tags: entry.meta.tags ?? [],
    featured: entry.meta.featured
  }));
  const edges: GraphEdge[] = [];

  for (const entry of entries) {
    for (const link of entry.links) {
      if (nodeIds.has(link.target)) {
        edges.push({ source: entry.slug, target: link.target });
      }
    }

    for (const related of entry.meta.related ?? []) {
      if (nodeIds.has(related)) {
        edges.push({ source: entry.slug, target: related });
      }
    }
  }

  const uniqueEdges = Array.from(
    new Map(edges.map((edge) => [`${edge.source}->${edge.target}`, edge])).values()
  );

  return { nodes, edges: uniqueEdges };
}

export function renderWikiLinks(markdown: string): string {
  return markdown.replace(
    /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g,
    (_full, target: string, alias?: string) => {
      const slug = normalizeSlug(target);
      const label = alias?.trim() || target.trim();
      return `[${label}](${resolveContentHref(slug)})`;
    }
  );
}

function resolveContentHref(slug: string): string {
  const target = getAllEntries().find((entry) => entry.slug === slug);

  if (!target) {
    return `/wiki/${slug}/`;
  }

  return `/${target.collection}/${target.slug}/`;
}

function formatFrontmatterValue(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value);
}

export function getCvMarkdown(): string {
  const filePath = path.join(CONTENT_ROOT, "cv.md");

  if (!fs.existsSync(filePath)) {
    return "";
  }

  return fs.readFileSync(filePath, "utf-8").trim();
}

function attachBacklinks(entries: ContentEntry[]): ContentEntry[] {
  const bySlug = new Map(entries.map((entry) => [entry.slug, { ...entry, backlinks: [] as Backlink[] }]));

  for (const entry of bySlug.values()) {
    for (const link of entry.links) {
      const target = bySlug.get(link.target);

      if (target && target.slug !== entry.slug) {
        target.backlinks.push(toBacklink(entry));
      }
    }

    for (const related of entry.meta.related ?? []) {
      const target = bySlug.get(related);

      if (target && target.slug !== entry.slug) {
        target.backlinks.push(toBacklink(entry));
      }
    }
  }

  return Array.from(bySlug.values()).map((entry) => ({
    ...entry,
    backlinks: dedupeBacklinks(entry.backlinks)
  }));
}

function toBacklink(entry: ContentEntry): Backlink {
  return {
    slug: entry.slug,
    title: entry.meta.title,
    collection: entry.collection,
    summary: entry.meta.summary
  };
}

function dedupeBacklinks(backlinks: Backlink[]): Backlink[] {
  return Array.from(new Map(backlinks.map((item) => [`${item.collection}:${item.slug}`, item])).values());
}

function sortByDate(a: ContentEntry, b: ContentEntry): number {
  const aDate = a.meta.updated ?? ("period" in a.meta ? a.meta.period : undefined) ?? "";
  const bDate = b.meta.updated ?? ("period" in b.meta ? b.meta.period : undefined) ?? "";
  return bDate.localeCompare(aDate);
}

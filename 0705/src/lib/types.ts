export type Collection = "wiki" | "projects" | "papers";

export type ContentStatus =
  | "seed"
  | "growing"
  | "evergreen"
  | "in-progress"
  | "submitted"
  | "published"
  | "archived";

export interface LinkItem {
  label: string;
  href: string;
}

export interface BaseFrontmatter {
  title: string;
  summary: string;
  tags?: string[];
  updated?: string;
  publish?: boolean;
  status?: ContentStatus;
  aliases?: string[];
  featured?: boolean;
  related?: string[];
}

export interface WikiFrontmatter extends BaseFrontmatter {
  area?: string;
}

export interface ProjectFrontmatter extends BaseFrontmatter {
  role?: string;
  period?: string;
  cover?: string;
  links?: LinkItem[];
}

export interface PaperFrontmatter extends BaseFrontmatter {
  authors?: string[];
  venue?: string;
  year?: string;
  bibtexKey?: string;
  links?: LinkItem[];
}

export type Frontmatter =
  | WikiFrontmatter
  | ProjectFrontmatter
  | PaperFrontmatter;

export interface ContentEntry<T extends Frontmatter = Frontmatter> {
  collection: Collection;
  slug: string;
  path: string;
  body: string;
  rawBody: string;
  links: WikiLink[];
  backlinks: Backlink[];
  meta: T;
}

export interface WikiLink {
  target: string;
  alias?: string;
  raw: string;
}

export interface Backlink {
  slug: string;
  title: string;
  collection: Collection;
  summary: string;
}

export interface GraphNode {
  id: string;
  title: string;
  collection: Collection;
  tags: string[];
  featured?: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
}

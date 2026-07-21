export type Collection = 'wiki' | 'papers' | 'projects'

export type ContentStatus =
	| 'seed'
	| 'growing'
	| 'evergreen'
	| 'in-progress'
	| 'submitted'
	| 'published'
	| 'archived'

export interface LinkItem {
	label: string
	href: string
}

export interface ContentFrontmatter {
	title: string
	summary: string
	tags: string[]
	updated?: string
	publish: boolean
	status?: ContentStatus
	aliases: string[]
	featured: boolean
	related: string[]
	area?: string
	role?: string
	period?: string
	cover?: string
	authors?: string[]
	venue?: string
	year?: string
	bibtexKey?: string
	links: LinkItem[]
}

export interface WikiLink {
	raw: string
	target: string
	alias?: string
	heading?: string
	resolvedId?: string
	href?: string
}

export interface Backlink {
	id: string
	collection: Collection
	slug: string
	title: string
	summary: string
}

export interface ContentEntry {
	id: string
	collection: Collection
	slug: string
	path: string
	body: string
	meta: ContentFrontmatter
	links: WikiLink[]
	backlinks: Backlink[]
}

export interface GraphNode {
	id: string
	slug: string
	title: string
	collection: Collection
	tags: string[]
	featured: boolean
}

export interface GraphEdge {
	source: string
	target: string
}

export interface SearchItem {
	id: string
	collection: Collection
	slug: string
	title: string
	summary: string
	body: string
	tags: string[]
	href: string
}

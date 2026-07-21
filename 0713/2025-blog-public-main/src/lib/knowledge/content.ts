import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { slugify } from '@/lib/markdown-renderer'
import type {
	Backlink,
	Collection,
	ContentEntry,
	ContentFrontmatter,
	GraphEdge,
	GraphNode,
	SearchItem,
	WikiLink
} from './types'

const CONTENT_ROOT = path.join(process.cwd(), 'content')
const collections: Collection[] = ['wiki', 'papers', 'projects']
const markdownExtensions = new Set(['.md', '.mdx'])

type Registry = {
	byId: Map<string, ContentEntry>
	byKey: Map<string, ContentEntry[]>
}

let publishedCache: ContentEntry[] | null = null

export function normalizeLookup(value: string): string {
	return decodeURIComponent(value)
		.trim()
		.replace(/\\/g, '/')
		.replace(/\.(md|mdx)$/i, '')
		.replace(/^\/+|\/+$/g, '')
		.replace(/\s+/g, '-')
		.toLowerCase()
}

function normalizeTarget(value: string): string {
	return normalizeLookup(value.split('#', 1)[0])
}

function formatValue(value: unknown): string | undefined {
	if (value === undefined || value === null || value === '') return undefined
	if (value instanceof Date) return value.toISOString().slice(0, 10)
	return String(value)
}

function toStringArray(value: unknown): string[] {
	return Array.isArray(value) ? value.map(String).map(item => item.trim()).filter(Boolean) : []
}

function coerceFrontmatter(collection: Collection, data: Record<string, unknown>): ContentFrontmatter {
	const links = Array.isArray(data.links)
		? data.links
				.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
				.map(item => ({ label: String(item.label ?? 'Link'), href: String(item.href ?? '#') }))
		: []

	return {
		title: String(data.title ?? 'Untitled'),
		summary: String(data.summary ?? ''),
		tags: toStringArray(data.tags),
		updated: formatValue(data.updated),
		publish: data.publish === true,
		status: data.status ? (String(data.status) as ContentFrontmatter['status']) : undefined,
		aliases: toStringArray(data.aliases ?? data.alias),
		featured: data.featured === true,
		related: toStringArray(data.related),
		area: collection === 'wiki' ? formatValue(data.area) : undefined,
		role: collection === 'projects' ? formatValue(data.role) : undefined,
		period: collection === 'projects' ? formatValue(data.period) : undefined,
		cover: collection === 'projects' ? formatValue(data.cover) : undefined,
		authors: collection === 'papers' ? toStringArray(data.authors) : undefined,
		venue: collection === 'papers' ? formatValue(data.venue) : undefined,
		year: collection === 'papers' ? formatValue(data.year) : undefined,
		bibtexKey: collection === 'papers' ? formatValue(data.bibtexKey) : undefined,
		links
	}
}

function readFilesRecursive(directory: string): string[] {
	if (!fs.existsSync(directory)) return []

	return fs
		.readdirSync(directory, { withFileTypes: true })
		.flatMap(entry => {
			const fullPath = path.join(directory, entry.name)
			if (entry.isDirectory()) return readFilesRecursive(fullPath)
			if (entry.isFile() && markdownExtensions.has(path.extname(entry.name))) return [fullPath]
			return []
		})
		.sort((a, b) => a.localeCompare(b))
}

function parseLinks(body: string): WikiLink[] {
	const links: WikiLink[] = []
	const pattern = /\[\[([^\]|#]+?)(?:#([^\]|]+?))?(?:\|([^\]]+?))?\]\]/g
	let match: RegExpExecArray | null

	while ((match = pattern.exec(body)) !== null) {
		links.push({
			raw: match[0],
			target: match[1].trim(),
			heading: match[2]?.trim(),
			alias: match[3]?.trim()
		})
	}

	return links
}

function readEntries(): ContentEntry[] {
	return collections.flatMap(collection => {
		const directory = path.join(CONTENT_ROOT, collection)
		return readFilesRecursive(directory).map(filePath => {
			const parsed = matter(fs.readFileSync(filePath, 'utf8'))
			const slug = normalizeLookup(path.relative(directory, filePath))
			const body = parsed.content.trim()

			return {
				id: `${collection}:${slug}`,
				collection,
				slug,
				path: filePath,
				body,
				meta: coerceFrontmatter(collection, parsed.data),
				links: parseLinks(body),
				backlinks: []
			}
		})
	})
}

function register(registry: Registry, key: string, entry: ContentEntry): void {
	const normalized = normalizeLookup(key)
	if (!normalized) return
	const entries = registry.byKey.get(normalized) ?? []
	if (!entries.some(item => item.id === entry.id)) entries.push(entry)
	registry.byKey.set(normalized, entries)
}

function createRegistry(entries: ContentEntry[]): Registry {
	const registry: Registry = { byId: new Map(), byKey: new Map() }

	for (const entry of entries) {
		registry.byId.set(entry.id, entry)
		register(registry, entry.id, entry)
		register(registry, entry.slug, entry)
		register(registry, `${entry.collection}/${entry.slug}`, entry)
		register(registry, entry.meta.title, entry)
		for (const alias of entry.meta.aliases) register(registry, alias, entry)
	}

	return registry
}

function pickCandidate(candidates: ContentEntry[], source?: ContentEntry): ContentEntry | undefined {
	if (candidates.length <= 1) return candidates[0]
	if (source) {
		const sameCollection = candidates.find(item => item.collection === source.collection)
		if (sameCollection) return sameCollection
	}
	return candidates.find(item => item.collection === 'wiki') ?? candidates[0]
}

function resolveTarget(target: string, registry: Registry, source?: ContentEntry): ContentEntry | undefined {
	const normalized = normalizeTarget(target)
	const idMatch = registry.byId.get(normalized)
	if (idMatch) return idMatch

	const slashIndex = normalized.indexOf('/')
	if (slashIndex > 0) {
		const collection = normalized.slice(0, slashIndex)
		const slug = normalized.slice(slashIndex + 1)
		const scoped = registry.byId.get(`${collection}:${slug}`)
		if (scoped) return scoped
	}

	return pickCandidate(registry.byKey.get(normalized) ?? [], source)
}

function entryHref(entry: ContentEntry, heading?: string): string {
	const fragment = heading ? `#${slugify(heading)}` : ''
	const encodedSlug = entry.slug.split('/').map(segment => encodeURIComponent(segment)).join('/')
	return `/${entry.collection}/${encodedSlug}/${fragment}`
}

function attachRelationships(entries: ContentEntry[]): ContentEntry[] {
	const registry = createRegistry(entries)
	const backlinks = new Map<string, Backlink[]>()

	for (const entry of entries) {
		entry.links = entry.links.map(link => {
			const target = resolveTarget(link.target, registry, entry)
			if (!target) return link

			const backlink: Backlink = {
				id: entry.id,
				collection: entry.collection,
				slug: entry.slug,
				title: entry.meta.title,
				summary: entry.meta.summary
			}
			backlinks.set(target.id, [...(backlinks.get(target.id) ?? []), backlink])

			return { ...link, resolvedId: target.id, href: entryHref(target, link.heading) }
		})

		for (const related of entry.meta.related) {
			const target = resolveTarget(related, registry, entry)
			if (!target) continue
			const backlink: Backlink = {
				id: entry.id,
				collection: entry.collection,
				slug: entry.slug,
				title: entry.meta.title,
				summary: entry.meta.summary
			}
			backlinks.set(target.id, [...(backlinks.get(target.id) ?? []), backlink])
		}
	}

	return entries.map(entry => ({
		...entry,
		backlinks: Array.from(new Map((backlinks.get(entry.id) ?? []).map(item => [item.id, item])).values())
	}))
}

function sortEntries(a: ContentEntry, b: ContentEntry): number {
	const aDate = a.meta.updated ?? a.meta.period ?? a.meta.year ?? ''
	const bDate = b.meta.updated ?? b.meta.period ?? b.meta.year ?? ''
	return bDate.localeCompare(aDate)
}

export function getPublishedEntries(): ContentEntry[] {
	if (!publishedCache) {
		publishedCache = attachRelationships(readEntries().filter(entry => entry.meta.publish)).sort(sortEntries)
	}
	return publishedCache
}

export function getEntriesByCollection(collection: Collection): ContentEntry[] {
	return getPublishedEntries().filter(entry => entry.collection === collection)
}

export function getEntry(collection: Collection, slug: string): ContentEntry | undefined {
	return getPublishedEntries().find(entry => entry.collection === collection && entry.slug === normalizeLookup(slug))
}

export function getEntryByTarget(target: string): ContentEntry | undefined {
	const entries = getPublishedEntries()
	return resolveTarget(target, createRegistry(entries))
}

export function getFeaturedEntries(limit = 6): ContentEntry[] {
	return getPublishedEntries().filter(entry => entry.meta.featured).slice(0, limit)
}

export function getAllTags(): { tag: string; count: number }[] {
	const counts = new Map<string, number>()
	for (const entry of getPublishedEntries()) {
		for (const tag of entry.meta.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
	}
	return Array.from(counts, ([tag, count]) => ({ tag, count })).sort((a, b) => a.tag.localeCompare(b.tag))
}

export function getEntriesByTag(tag: string): ContentEntry[] {
	const normalized = tag.trim().toLocaleLowerCase()
	return getPublishedEntries().filter(entry => entry.meta.tags.some(item => item.toLocaleLowerCase() === normalized))
}

export function getSearchItems(): SearchItem[] {
	return getPublishedEntries().map(entry => ({
		id: entry.id,
		collection: entry.collection,
		slug: entry.slug,
		title: entry.meta.title,
		summary: entry.meta.summary,
		body: entry.body,
		tags: entry.meta.tags,
		href: `/${entry.collection}/${entry.slug}/`
	}))
}

export function buildGraph(entries = getPublishedEntries()): { nodes: GraphNode[]; edges: GraphEdge[] } {
	const ids = new Set(entries.map(entry => entry.id))
	const registry = createRegistry(entries)
	const nodes = entries.map(entry => ({
		id: entry.id,
		slug: entry.slug,
		title: entry.meta.title,
		collection: entry.collection,
		tags: entry.meta.tags,
		featured: entry.meta.featured
	}))
	const edges: GraphEdge[] = []

	for (const entry of entries) {
		for (const link of entry.links) {
			if (link.resolvedId && ids.has(link.resolvedId)) edges.push({ source: entry.id, target: link.resolvedId })
		}
		for (const related of entry.meta.related) {
			const target = resolveTarget(related, registry, entry)
			if (target && ids.has(target.id)) edges.push({ source: entry.id, target: target.id })
		}
	}

	return {
		nodes,
		edges: Array.from(new Map(edges.map(edge => [`${edge.source}->${edge.target}`, edge])).values())
	}
}

function escapeHtml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function renderWikiLinks(entry: ContentEntry): string {
	let output = entry.body
	for (const link of entry.links) {
		const label = link.alias || link.target
		const replacement = link.href
			? `[${label.replace(/[\\[\]]/g, '\\$&')}](${link.href})`
			: `<span class="wikilink-unresolved" title="Unresolved note: ${escapeHtml(link.target)}">${escapeHtml(label)}</span>`
		output = output.split(link.raw).join(replacement)
	}
	return output
}

export function getCvMarkdown(): string {
	const filePath = path.join(CONTENT_ROOT, 'cv.md')
	return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').trim() : ''
}

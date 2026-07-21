'use client'

import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import type { GraphEdge, GraphNode } from '@/lib/knowledge/types'
import { withSiteBase } from '@/lib/site-path'

const colors = {
	wiki: '#1fb7a6',
	papers: '#2d82d8',
	projects: '#f29c45'
}

interface SimNode extends d3.SimulationNodeDatum, GraphNode {}
interface SimEdge extends d3.SimulationLinkDatum<SimNode> {
	source: string | SimNode
	target: string | SimNode
}

type CachedPosition = { id: string; xRatio: number; yRatio: number }
const graphLayoutCache = new Map<string, CachedPosition[]>()
const MAX_LAYOUT_CACHE_ENTRIES = 32
const GRAPH_LAYOUT_VERSION = 2

function getDisplayLabel(title: string, width: number, compact: boolean): string {
	const maxLength = compact ? (width < 300 ? 7 : 12) : width < 520 ? 7 : 16
	return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
}

type KnowledgeGraphProps = {
	nodes: GraphNode[]
	edges: GraphEdge[]
	compact?: boolean
	publicSiteLinks?: boolean
	currentNodeId?: string
}

function getNodePath(node: GraphNode, publicSiteLinks: boolean): string {
	if (!publicSiteLinks) return `/${node.collection}/${node.slug}/`
	if (node.collection === 'wiki') return `/blog/${node.slug}/`
	return '/projects/'
}

export function KnowledgeGraph({ nodes, edges, compact = false, publicSiteLinks = false, currentNodeId }: KnowledgeGraphProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const svgRef = useRef<SVGSVGElement>(null)

	useEffect(() => {
		const container = containerRef.current
		const svgElement = svgRef.current
		if (!container || !svgElement) return

		let simulation: d3.Simulation<SimNode, SimEdge> | undefined
		let stopTimer: number | undefined
		let resizeFrame: number | undefined
		const render = () => {
			if (stopTimer) {
				window.clearTimeout(stopTimer)
				stopTimer = undefined
			}
			const width = Math.max(container.clientWidth, 320)
			const height = Math.max(container.clientHeight, compact ? 300 : 440)
			const narrow = width < 520
			const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
			const svg = d3.select(svgElement)
			svg.selectAll('*').remove()
			svg.attr('viewBox', `0 0 ${width} ${height}`)

			const simNodes: SimNode[] = nodes.map(node => ({ ...node }))
			const nodeIds = new Set(simNodes.map(node => node.id))
			const simEdges: SimEdge[] = edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target)).map(edge => ({ ...edge }))
			const neighborIds = new Map(simNodes.map(node => [node.id, new Set<string>()]))
			for (const edge of simEdges) {
				const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id
				const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id
				neighborIds.get(sourceId)?.add(targetId)
				neighborIds.get(targetId)?.add(sourceId)
			}
			const graphSignature = `${nodes.map(item => item.id).join('|')}::${edges.map(item => `${item.source}>${item.target}`).join('|')}`
			const cacheKey = `${GRAPH_LAYOUT_VERSION}:${graphSignature}:${compact ? 'compact' : 'full'}:${Math.round(width / 32)}:${Math.round(height / 32)}`
			const cachedPositions = graphLayoutCache.get(cacheKey)
			if (cachedPositions) {
				const positionById = new Map(cachedPositions.map(item => [item.id, item]))
				for (const item of simNodes) {
					const cached = positionById.get(item.id)
					if (!cached) continue
					item.x = cached.xRatio * width
					item.y = cached.yRatio * height
				}
			}
			const degreeById = new Map(simNodes.map(node => [node.id, 0]))
			for (const edge of simEdges) {
				const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id
				const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id
				degreeById.set(sourceId, (degreeById.get(sourceId) ?? 0) + 1)
				degreeById.set(targetId, (degreeById.get(targetId) ?? 0) + 1)
			}
			if (!cachedPositions) {
				const isolatedNodes = simNodes.filter(node => (degreeById.get(node.id) ?? 0) === 0)
				isolatedNodes.forEach((item, index) => {
					const angle = -Math.PI / 2 + (index * Math.PI * 2) / Math.max(isolatedNodes.length, 1)
					item.x = width / 2 + Math.cos(angle) * width * 0.32
					item.y = height / 2 + Math.sin(angle) * height * 0.3
				})
			}
			const rankedNodes = [...simNodes].sort(
				(a, b) =>
					Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (degreeById.get(b.id) ?? 0) - (degreeById.get(a.id) ?? 0) || a.id.localeCompare(b.id)
			)
			const narrowLabelIds = new Set<string>()
			for (const collection of ['wiki', 'papers', 'projects'] as const) {
				const representative = rankedNodes.find(node => node.collection === collection)
				if (representative) narrowLabelIds.add(representative.id)
			}
			for (const item of rankedNodes) {
				if (narrowLabelIds.size >= 6) break
				narrowLabelIds.add(item.id)
			}
			const nodeRadius = (item: GraphNode) => {
				if (narrow) return item.featured ? 10 : 7
				if (compact) return item.featured ? 11 : 8
				return item.featured ? 12 : 9
			}
			const root = svg.append('g')

			svg.call(
				d3
					.zoom<SVGSVGElement, unknown>()
					.scaleExtent([0.55, 2.4])
					.filter(event => event.type !== 'dblclick' && event.pointerType !== 'touch')
					.on('zoom', event => root.attr('transform', event.transform))
			)

			const line = root
				.append('g')
				.attr('stroke', 'rgba(46, 91, 111, 0.22)')
				.attr('stroke-width', 1.3)
				.selectAll('line')
				.data(simEdges)
				.join('line')
				.style('transition', reduceMotion ? 'none' : 'stroke-opacity 160ms cubic-bezier(0.22, 1, 0.36, 1), stroke-width 160ms cubic-bezier(0.22, 1, 0.36, 1)')

			const node = root
				.append('g')
				.selectAll<SVGGElement, SimNode>('g')
				.data(simNodes)
				.join('g')
				.attr('class', 'knowledge-graph-node')
				.attr('role', 'link')
				.attr('tabindex', 0)
				.attr('aria-label', item => `${item.title}, ${item.collection}${item.id === currentNodeId ? ', 当前文章' : ''}`)
				.on('click', (_event, item) => window.location.assign(withSiteBase(getNodePath(item, publicSiteLinks))))
				.on('keydown', (event, item) => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault()
						window.location.assign(withSiteBase(getNodePath(item, publicSiteLinks)))
					}
				})

			const nodeVisual = node
				.append('g')
				.attr('class', 'knowledge-graph-node-visual')
				.style('transform-box', 'fill-box')
				.style('transform-origin', 'center')
				.style('transition', reduceMotion ? 'none' : 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)')

			const circle = nodeVisual
				.append('circle')
				.attr('r', item => nodeRadius(item))
				.attr('fill', item => colors[item.collection])
				.attr('opacity', item => (currentNodeId && item.id !== currentNodeId ? 0.34 : 1))
				.style('transition', reduceMotion ? 'none' : 'opacity 160ms cubic-bezier(0.22, 1, 0.36, 1)')
			node.append('title').text(item => `${item.title} (${item.collection})`)
			const labeledNode = narrow ? node.filter(item => narrowLabelIds.has(item.id)) : node
			const label = labeledNode
				.select<SVGGElement>('.knowledge-graph-node-visual')
				.append('text')
				.attr('y', item => nodeRadius(item) + (narrow ? 14 : 17))
				.attr('text-anchor', 'middle')
				.attr('font-size', narrow ? 9 : compact ? 10.5 : 12)
				.attr('font-weight', 600)
				.attr('opacity', item => (currentNodeId && item.id !== currentNodeId ? 0.38 : 1))
				.attr('fill', '#17353f')
				.attr('stroke', 'rgba(255, 255, 255, 0.96)')
				.attr('stroke-width', narrow ? 3 : 4)
				.attr('stroke-linejoin', 'round')
				.attr('paint-order', 'stroke')
				.attr('pointer-events', 'none')
				.style('transition', reduceMotion ? 'none' : 'opacity 160ms cubic-bezier(0.22, 1, 0.36, 1)')
				.text(item => getDisplayLabel(item.title, width, compact))

			const edgeIds = (edge: SimEdge) => ({
				sourceId: typeof edge.source === 'string' ? edge.source : edge.source.id,
				targetId: typeof edge.target === 'string' ? edge.target : edge.target.id
			})
			const resetGraphFocus = () => {
				circle.attr('opacity', item => (currentNodeId && item.id !== currentNodeId ? 0.34 : 1))
				label.attr('opacity', item => (currentNodeId && item.id !== currentNodeId ? 0.38 : 1))
				line.attr('stroke-opacity', 1).attr('stroke-width', 1.3)
				nodeVisual.style('transform', 'scale(1)')
			}
			const focusGraphNode = (focusId: string, dragging = false) => {
				const neighbors = neighborIds.get(focusId) ?? new Set<string>()
				circle.attr('opacity', item => {
					if (item.id === focusId || item.id === currentNodeId) return 1
					if (neighbors.has(item.id)) return 0.72
					return 0.16
				})
				label.attr('opacity', item => {
					if (item.id === focusId || item.id === currentNodeId) return 1
					if (neighbors.has(item.id)) return 0.68
					return 0.14
				})
				line
					.attr('stroke-opacity', edge => {
						const { sourceId, targetId } = edgeIds(edge)
						return sourceId === focusId || targetId === focusId ? 1 : 0.28
					})
					.attr('stroke-width', edge => {
						const { sourceId, targetId } = edgeIds(edge)
						return sourceId === focusId || targetId === focusId ? 1.7 : 1.1
					})
				nodeVisual.style('transform', item => (item.id === focusId ? `scale(${dragging ? 1.08 : 1.06})` : 'scale(1)'))
			}

			node
				.on('pointerenter.motion-feedback', (_event, item) => focusGraphNode(item.id))
				.on('pointerleave.motion-feedback', resetGraphFocus)
				.on('focus.motion-feedback', (_event, item) => focusGraphNode(item.id))
				.on('blur.motion-feedback', resetGraphFocus)

			if (!reduceMotion) {
				node.call(
					d3
						.drag<SVGGElement, SimNode>()
						.on('start', (event, item) => {
							if (stopTimer) window.clearTimeout(stopTimer)
							if (!event.active) simulation?.alphaTarget(0.25).restart()
							focusGraphNode(item.id, true)
							item.fx = item.x
							item.fy = item.y
						})
						.on('drag', (event, item) => {
							item.fx = event.x
							item.fy = event.y
						})
						.on('end', (event, item) => {
							if (!event.active) simulation?.alphaTarget(0)
							item.fx = null
							item.fy = null
							resetGraphFocus()
							stopTimer = window.setTimeout(() => simulation?.stop(), 320)
						})
				)
			}

			const horizontalPadding = narrow ? 50 : compact ? 76 : 88
			const topPadding = narrow ? 46 : 52
			const bottomPadding = narrow ? 42 : 52
			const constrainPositions = () => {
				for (const item of simNodes) {
					item.x = Math.max(horizontalPadding, Math.min(width - horizontalPadding, item.x ?? width / 2))
					item.y = Math.max(topPadding, Math.min(height - bottomPadding, item.y ?? height / 2))
				}
			}
			const separateOverlappingNodes = () => {
				constrainPositions()
				const gap = narrow ? 8 : 10
				for (let iteration = 0; iteration < 12; iteration += 1) {
					let moved = false
					for (let leftIndex = 0; leftIndex < simNodes.length; leftIndex += 1) {
						for (let rightIndex = leftIndex + 1; rightIndex < simNodes.length; rightIndex += 1) {
							const left = simNodes[leftIndex]
							const right = simNodes[rightIndex]
							let deltaX = (right.x ?? 0) - (left.x ?? 0)
							let deltaY = (right.y ?? 0) - (left.y ?? 0)
							let distance = Math.hypot(deltaX, deltaY)
							const minimumDistance = nodeRadius(left) + nodeRadius(right) + gap
							if (distance >= minimumDistance) continue
							if (distance < 0.001) {
								const angle = ((leftIndex + 1) * 2.399963 + (rightIndex + 1) * 0.618034) % (Math.PI * 2)
								deltaX = Math.cos(angle)
								deltaY = Math.sin(angle)
								distance = 1
							}
							const shift = (minimumDistance - distance) / 2
							const unitX = deltaX / distance
							const unitY = deltaY / distance
							left.x = (left.x ?? width / 2) - unitX * shift
							left.y = (left.y ?? height / 2) - unitY * shift
							right.x = (right.x ?? width / 2) + unitX * shift
							right.y = (right.y ?? height / 2) + unitY * shift
							moved = true
						}
					}
					constrainPositions()
					if (!moved) break
				}
			}

			simulation?.stop()
			simulation = d3
				.forceSimulation<SimNode>(simNodes)
				.force(
					'link',
					d3
						.forceLink<SimNode, SimEdge>(simEdges)
						.id(item => item.id)
						.distance(narrow ? 58 : compact ? 94 : 112)
						.strength(0.52)
				)
				.force('charge', d3.forceManyBody().strength(narrow ? -95 : compact ? -190 : -240))
				.force('center', d3.forceCenter(width / 2, height / 2))
				.force('x', d3.forceX<SimNode>(width / 2).strength(narrow ? 0.04 : 0.025))
				.force('y', d3.forceY<SimNode>(height / 2).strength(narrow ? 0.045 : 0.03))
				.force(
					'collision',
					d3.forceCollide<SimNode>().radius(item => (narrow ? (narrowLabelIds.has(item.id) ? 45 : 26) : compact ? 58 : 68))
				)

			const updatePositions = () => {
				constrainPositions()
				line
					.attr('x1', edge => (edge.source as SimNode).x ?? 0)
					.attr('y1', edge => (edge.source as SimNode).y ?? 0)
					.attr('x2', edge => (edge.target as SimNode).x ?? 0)
					.attr('y2', edge => (edge.target as SimNode).y ?? 0)
				node.attr('transform', item => `translate(${item.x ?? 0}, ${item.y ?? 0})`)
			}

			simulation.on('tick', updatePositions)
			simulation.stop()
			if (!cachedPositions) {
				for (let index = 0; index < 140; index += 1) simulation.tick()
				separateOverlappingNodes()
				graphLayoutCache.set(
					cacheKey,
					simNodes.map(item => ({ id: item.id, xRatio: (item.x ?? width / 2) / width, yRatio: (item.y ?? height / 2) / height }))
				)
				if (graphLayoutCache.size > MAX_LAYOUT_CACHE_ENTRIES) {
					const oldestKey = graphLayoutCache.keys().next().value
					if (oldestKey) graphLayoutCache.delete(oldestKey)
				}
			} else {
				separateOverlappingNodes()
			}
			updatePositions()
		}

		render()
		const observer = new ResizeObserver(() => {
			if (resizeFrame) window.cancelAnimationFrame(resizeFrame)
			resizeFrame = window.requestAnimationFrame(render)
		})
		observer.observe(container)
		return () => {
			observer.disconnect()
			if (resizeFrame) window.cancelAnimationFrame(resizeFrame)
			if (stopTimer) window.clearTimeout(stopTimer)
			simulation?.stop()
		}
	}, [nodes, edges, compact, publicSiteLinks, currentNodeId])

	return (
		<div ref={containerRef} className={`knowledge-graph ${compact ? 'knowledge-graph-compact' : ''}`}>
			<svg ref={svgRef} role='img' aria-label={publicSiteLinks ? '公开笔记与项目关系图' : 'Wiki、paper 与 project 的关系图'} />
			<p className='sr-only'>图中每个节点都可通过键盘聚焦，并可打开对应的公开内容页面。</p>
		</div>
	)
}

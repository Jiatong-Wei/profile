'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import type { GraphEdge, GraphNode } from '@/lib/knowledge/types'

const KnowledgeGraph = dynamic(() => import('@/components/knowledge/graph').then(module => module.KnowledgeGraph), {
	ssr: false,
	loading: () => <div className='knowledge-graph knowledge-graph-compact knowledge-graph-placeholder' aria-hidden='true' />
})

type DeferredKnowledgeGraphProps = {
	nodes: GraphNode[]
	edges: GraphEdge[]
	currentNodeId?: string
}

export function DeferredKnowledgeGraph({ nodes, edges, currentNodeId }: DeferredKnowledgeGraphProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [ready, setReady] = useState(false)

	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		const observer = new IntersectionObserver(
			entries => {
				if (!entries.some(entry => entry.isIntersecting)) return
				setReady(true)
				observer.disconnect()
			},
			{ rootMargin: '160px' }
		)

		observer.observe(container)
		return () => observer.disconnect()
	}, [])

	return (
		<div ref={containerRef} className='knowledge-graph-slot'>
			{ready ? (
				<KnowledgeGraph nodes={nodes} edges={edges} compact publicSiteLinks currentNodeId={currentNodeId} />
			) : (
				<div className='knowledge-graph knowledge-graph-compact knowledge-graph-placeholder' aria-hidden='true' />
			)}
		</div>
	)
}

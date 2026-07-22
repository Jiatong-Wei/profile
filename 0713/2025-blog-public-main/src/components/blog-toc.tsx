'use client'

import clsx from 'clsx'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { SELECTION_SPRING } from '@/lib/motion'

type TocItem = {
	id: string
	text: string
	level: number
}

type BlogTocProps = { toc: TocItem[]; entranceDelay?: number; embedded?: boolean }

const TOC_NAVIGATION_LOCK_MS = 900

function getHashId() {
	const hash = window.location.hash.slice(1)
	try {
		return decodeURIComponent(hash)
	} catch {
		return hash
	}
}

export function BlogToc({ toc, entranceDelay = 0, embedded = false }: BlogTocProps) {
	const [activeId, setActiveId] = useState<string | undefined>(toc[0]?.id)
	const navigationLockRef = useRef<{ id: string; until: number } | null>(null)
	const reduceMotion = useReducedMotion()
	const lockActiveId = (id: string) => {
		navigationLockRef.current = { id, until: performance.now() + TOC_NAVIGATION_LOCK_MS }
		setActiveId(id)
	}

	useEffect(() => {
		if (toc.length === 0) {
			setActiveId(undefined)
			return
		}

		let frame = 0
		const updateActiveId = () => {
			frame = 0
			const navigationLock = navigationLockRef.current
			if (navigationLock && performance.now() < navigationLock.until) {
				setActiveId(navigationLock.id)
				return
			}
			navigationLockRef.current = null

			let nextActiveId = toc[0]?.id
			const remainingScroll = Math.max(0, document.documentElement.scrollHeight - window.scrollY - window.innerHeight)
			const endProgress = window.scrollY > 0 ? 1 - Math.min(1, remainingScroll / window.innerHeight) : 0
			const activationOffset = 120 + (window.innerHeight * 0.82 - 120) * endProgress

			for (const item of toc) {
				const heading = document.getElementById(item.id)
				if (!heading || heading.getBoundingClientRect().top > activationOffset) break
				nextActiveId = item.id
			}

			setActiveId(previous => (previous === nextActiveId ? previous : nextActiveId))
		}
		const scheduleUpdate = () => {
			if (frame) return
			frame = window.requestAnimationFrame(updateActiveId)
		}
		const syncHash = () => {
			const hashId = getHashId()
			if (!toc.some(item => item.id === hashId)) return
			navigationLockRef.current = { id: hashId, until: performance.now() + TOC_NAVIGATION_LOCK_MS }
			setActiveId(hashId)
		}

		updateActiveId()
		syncHash()
		window.addEventListener('scroll', scheduleUpdate, { passive: true })
		window.addEventListener('resize', scheduleUpdate)
		window.addEventListener('hashchange', syncHash)

		return () => {
			if (frame) window.cancelAnimationFrame(frame)
			window.removeEventListener('scroll', scheduleUpdate)
			window.removeEventListener('resize', scheduleUpdate)
			window.removeEventListener('hashchange', syncHash)
		}
	}, [toc])

	return (
		<div
			className={clsx(embedded ? 'article-inspector-section' : 'glass-panel glass-standard w-full rounded-xl p-3', 'article-sidebar-enter text-sm')}
			style={{ '--article-sidebar-delay': `${entranceDelay}ms` } as CSSProperties}>
			<h2 className='text-secondary mb-2 font-medium'>目录</h2>
			<motion.div layoutScroll className='relative max-h-[300px] space-y-1 overflow-auto'>
				{toc.length === 0 && <div className='text-secondary'>暂无</div>}
				{toc.map(item => (
					<a
						key={item.id + item.level}
						href={`#${item.id}`}
						onClick={() => lockActiveId(item.id)}
						className={clsx('hover:text-brand-ink relative block min-h-7 rounded-lg py-1 pr-2 transition-colors', item.id === activeId && 'text-brand-ink')}
						style={{ paddingLeft: Math.max(8, (item.level - 1) * 8 + 8) }}>
						{item.id === activeId && (
							<motion.span
								layoutId={reduceMotion ? undefined : 'article-toc-selection'}
								className='article-toc-selection'
								transition={reduceMotion ? { duration: 0 } : SELECTION_SPRING}
							/>
						)}
						<span className='relative z-10'>{item.text}</span>
					</a>
				))}
			</motion.div>
		</div>
	)
}

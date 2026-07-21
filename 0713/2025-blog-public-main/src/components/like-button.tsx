'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Heart } from 'lucide-react'
import clsx from 'clsx'

type LikeButtonProps = {
	slug?: string
	className?: string
}

const PARTICLE_OFFSETS = [
	{ x: -28, y: -22 },
	{ x: -12, y: -34 },
	{ x: 14, y: -34 },
	{ x: 28, y: -20 }
] as const

// This is intentionally local-only. GitHub Pages has no write endpoint, so the
// interaction must not send visitor data to the upstream template service.
export default function LikeButton({ slug = 'page', className }: LikeButtonProps) {
	const storageKey = `profile-like:${slug}`
	const [liked, setLiked] = useState(false)
	const [justLiked, setJustLiked] = useState(false)
	const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])
	const particleTimerRef = useRef<number | null>(null)

	useEffect(() => {
		try {
			setLiked(window.localStorage.getItem(storageKey) === '1')
		} catch {
			// Storage can be unavailable in privacy mode; the button still works in memory.
		}
	}, [storageKey])

	useEffect(() => {
		if (!justLiked) return
		const timer = window.setTimeout(() => setJustLiked(false), 600)
		return () => window.clearTimeout(timer)
	}, [justLiked])

	useEffect(() => {
		return () => {
			if (particleTimerRef.current !== null) window.clearTimeout(particleTimerRef.current)
		}
	}, [])

	const handleLike = () => {
		const next = !liked
		setLiked(next)
		setJustLiked(next)
		setParticles(
			next
				? PARTICLE_OFFSETS.map((offset, index) => ({
						id: Date.now() + index,
						...offset
					}))
				: []
		)
		if (particleTimerRef.current !== null) window.clearTimeout(particleTimerRef.current)
		particleTimerRef.current = next
			? window.setTimeout(() => {
					setParticles([])
					particleTimerRef.current = null
				}, 600)
			: null
		try {
			if (next) window.localStorage.setItem(storageKey, '1')
			else window.localStorage.removeItem(storageKey)
		} catch {
			// Keep the in-memory state when storage is blocked.
		}
	}

	return (
		<button
			aria-label={liked ? '取消标记喜欢' : '标记喜欢'}
			aria-pressed={liked}
			onClick={handleLike}
			className={clsx('card glass-quiet heartbeat-container like-button-shell article-enter relative overflow-visible rounded-full p-3', className)}>
			{particles.map(particle => (
				<span
					key={particle.id}
					className='like-particle pointer-events-none absolute inset-0 flex items-center justify-center'
					style={{ '--particle-x': `${particle.x}px`, '--particle-y': `${particle.y}px` } as CSSProperties}>
					<Heart className='fill-rose-400 text-rose-400' size={12} />
				</span>
			))}
			<span className={clsx('like-heart-feedback flex', justLiked && 'is-active')}>
				<Heart className={clsx('heartbeat', liked ? 'fill-rose-400 text-rose-400' : 'fill-rose-200 text-rose-200')} size={28} />
			</span>
		</button>
	)
}

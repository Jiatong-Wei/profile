'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Boxes, Globe2, ScrollText, Star, UserRound } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { useCenterStore } from '@/hooks/use-center'
import { useSize } from '@/hooks/use-size'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { useLayoutEditStore } from '@/app/(home)/stores/layout-edit-store'
import { HomeDraggableLayer } from '@/app/(home)/home-draggable-layer'
import { cn } from '@/lib/utils'
import { withSiteBase, withoutSiteBase } from '@/lib/site-path'
import { CARD_SPACING, snapToHomeGrid } from '@/consts'
import { APPLE_EASE_OUT, SELECTION_SPRING, SPRING_SNAPPY, windowReveal } from '@/lib/motion'

const MotionLink = motion.create(Link)

const navigationItems = [
	{ icon: ScrollText, label: '近期文章', href: '/blog' },
	{ icon: Boxes, label: '我的项目', href: '/projects' },
	{ icon: UserRound, label: '关于网站', href: '/about' },
	{ icon: Star, label: '推荐分享', href: '/share' },
	{ icon: Globe2, label: '优秀博客', href: '/bloggers' }
]

type NavForm = 'full' | 'compact' | 'mini' | 'dock'
const EXPANDED_CONTENT_DELAY_MS = 100

export default function NavCard() {
	const pathname = withoutSiteBase(usePathname() || '/')
	const center = useCenterStore()
	const { maxSM, maxLG } = useSize()
	const { siteContent, cardStyles } = useConfigStore()
	const interactingLayout = useLayoutEditStore(state => state.interacting)
	const layoutInteraction = useLayoutEditStore(state => state.interaction)
	const [mounted, setMounted] = useState(false)
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
	const [scrolled, setScrolled] = useState(false)
	const reduceMotion = useReducedMotion()
	const styles = cardStyles.navCard
	const hiCardStyles = cardStyles.hiCard
	const form: NavForm = maxSM ? 'dock' : pathname === '/write' || pathname.startsWith('/write/') ? 'mini' : pathname === '/' && !maxLG ? 'full' : 'compact'
	const [expandedContentReady, setExpandedContentReady] = useState(form === 'full')
	const previousFormRef = useRef<NavForm>(form)

	useEffect(() => setMounted(true), [])
	useEffect(() => {
		const updateScrolled = () => setScrolled(window.scrollY > 12)
		updateScrolled()
		window.addEventListener('scroll', updateScrolled, { passive: true })
		return () => window.removeEventListener('scroll', updateScrolled)
	}, [])
	useEffect(() => {
		const previousForm = previousFormRef.current
		previousFormRef.current = form
		if (form !== 'full') {
			setExpandedContentReady(false)
			return
		}
		if (previousForm === 'full' || reduceMotion) {
			setExpandedContentReady(true)
			return
		}
		setExpandedContentReady(false)
		const timer = window.setTimeout(() => setExpandedContentReady(true), EXPANDED_CONTENT_DELAY_MS)
		return () => window.clearTimeout(timer)
	}, [form, reduceMotion])

	const activeIndex = useMemo(() => navigationItems.findIndex(item => pathname === item.href || pathname.startsWith(`${item.href}/`)), [pathname])
	const displayIndex = hoveredIndex ?? activeIndex
	const size = form === 'full' ? { width: styles.width, height: styles.height } : form === 'mini' ? { width: 64, height: 64 } : { width: 340, height: 64 }
	const position =
		form === 'full'
			? {
					x: styles.offsetX !== null ? center.x + styles.offsetX : snapToHomeGrid(center.x - hiCardStyles.width / 2 - styles.width - CARD_SPACING),
					y: styles.offsetY !== null ? center.y + styles.offsetY : snapToHomeGrid(center.y + hiCardStyles.height / 2 - styles.height)
				}
			: { x: maxSM ? snapToHomeGrid(Math.max(12, center.x - size.width / 2)) : 24, y: 16 }
	const selectionTransition = reduceMotion ? { duration: 0 } : SELECTION_SPRING
	const visibilityTransition = reduceMotion ? { duration: 0 } : { duration: 0.12, ease: APPLE_EASE_OUT }
	const expandedContentTransition = reduceMotion ? { duration: 0 } : { duration: 0.2, ease: APPLE_EASE_OUT }
	const showExpandedContent = form === 'full' && expandedContentReady
	const geometryTransition = reduceMotion || interactingLayout
		? 'none'
		: 'left 380ms cubic-bezier(0.22, 1, 0.36, 1), top 380ms cubic-bezier(0.22, 1, 0.36, 1), width 380ms cubic-bezier(0.22, 1, 0.36, 1), height 380ms cubic-bezier(0.22, 1, 0.36, 1)'
	const isFloatingToolbar = form === 'compact' || form === 'mini'
	const isLayoutDragging = layoutInteraction?.cardKey === 'navCard' && (layoutInteraction.phase === 'dragging' || layoutInteraction.phase === 'resizing')

	if (!mounted || position.x === 0 || position.y === 0) return null

	const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
		if (event.pointerType !== 'mouse') return
		const rect = event.currentTarget.getBoundingClientRect()
		event.currentTarget.style.setProperty('--glass-x', `${((event.clientX - rect.left) / rect.width) * 100}%`)
		event.currentTarget.style.setProperty('--glass-y', `${((event.clientY - rect.top) / rect.height) * 100}%`)
	}

	const shell = (
		<motion.nav
			variants={windowReveal(Math.min(Math.max(0, styles.order - 1) * 0.03, 0.16))}
			initial='hidden'
			animate='visible'
			aria-label='主要导航'
			className={cn(
				'site-nav-shell glass-panel glass-primary glass-interactive squircle z-50',
				`nav-${form}`,
				isFloatingToolbar && scrolled && 'is-scrolled',
				isLayoutDragging && 'is-layout-dragging'
			)}
			style={{ left: position.x, top: position.y, width: size.width, height: size.height, transition: geometryTransition } as CSSProperties}
			onPointerMove={handlePointerMove}
			onPointerLeave={event => {
				setHoveredIndex(null)
				event.currentTarget.style.setProperty('--glass-x', '50%')
				event.currentTarget.style.setProperty('--glass-y', '18%')
			}}>
			<motion.div
				className={cn('nav-content', form === 'full' ? 'nav-content-full' : 'nav-content-compact')}
				>
				<MotionLink className='nav-profile-link' href='/' aria-label='返回首页' title='返回首页'>
					<motion.picture
						tabIndex={-1}
						className='block shrink-0'
						whileHover={{ scale: 1.015 }}
						whileTap={{ scale: 0.97 }}
						transition={{ scale: SPRING_SNAPPY }}>
						<img src={withSiteBase('/selfish/beger-avatar.webp')} alt='Leo' width={40} height={40} className='nav-avatar' />
					</motion.picture>
					<AnimatePresence mode='popLayout' initial={false}>
						{showExpandedContent && (
							<motion.span
								key='profile-label'
								className='inline-flex min-w-0 items-baseline whitespace-nowrap'
								initial={{ opacity: 0, y: 3 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -1 }}
								transition={expandedContentTransition}>
								<strong className='leo-name font-averia text-2xl leading-none'>Leo</strong>
								<small className='text-brand ml-1 text-xs font-medium'>开发中</small>
							</motion.span>
						)}
					</AnimatePresence>
				</MotionLink>

				<AnimatePresence initial={false}>
					{showExpandedContent && siteContent.enableChristmas && (
						<motion.img
							key='nav-christmas-decoration'
							src={withSiteBase('/images/christmas/snow-4.webp')}
							alt=''
							className='pointer-events-none absolute -top-5 -left-4 w-40 opacity-90'
							initial={{ opacity: 0 }}
							animate={{ opacity: 0.9 }}
							exit={{ opacity: 0 }}
							transition={visibilityTransition}
						/>
					)}
				</AnimatePresence>

				<AnimatePresence initial={false}>
					{form !== 'mini' && (
						<motion.div
							key='nav-items'
							className={cn('nav-items', form === 'full' ? 'nav-items-full' : 'nav-items-compact')}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ opacity: visibilityTransition }}>
							<AnimatePresence mode='popLayout' initial={false}>
								{showExpandedContent && (
									<motion.div
										key='nav-section-label'
										className='nav-section-label'
										initial={{ opacity: 0, y: 3 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -1 }}
										transition={expandedContentTransition}>
										General
									</motion.div>
								)}
							</AnimatePresence>
							{navigationItems.map((item, index) => {
								const Icon = item.icon
								const selected = displayIndex === index
								const active = activeIndex === index
								return (
									<MotionLink
										key={item.href}
										href={item.href}
										aria-label={item.label}
										title={item.label}
										className={cn('nav-item', form === 'full' ? 'nav-item-full' : 'nav-item-compact', active && 'is-active')}
										onMouseEnter={() => setHoveredIndex(index)}
										onFocus={() => setHoveredIndex(index)}
										onBlur={() => setHoveredIndex(null)}
										>
										{selected && <motion.span layoutId='site-nav-selection' className='nav-selection' transition={selectionTransition} />}
										<motion.span
											className='nav-item-symbol'
											animate={{ scale: active ? 1.04 : 1 }}
											transition={{ scale: SPRING_SNAPPY }}>
											<Icon size={21} strokeWidth={1.8} aria-hidden='true' />
										</motion.span>
										<AnimatePresence mode='popLayout' initial={false}>
											{showExpandedContent && (
												<motion.span
													key={`${item.href}-label`}
													className='nav-item-label'
													initial={{ opacity: 0, y: 3 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -1 }}
													transition={
														reduceMotion
															? { duration: 0 }
															: { duration: 0.2, delay: index * 0.015, ease: APPLE_EASE_OUT }
													}>
													{item.label}
												</motion.span>
											)}
										</AnimatePresence>
									</MotionLink>
								)
							})}
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</motion.nav>
	)

	if (form === 'dock') return shell

	return (
		<HomeDraggableLayer cardKey='navCard' x={position.x} y={position.y} width={size.width} height={size.height}>
			{shell}
		</HomeDraggableLayer>
	)
}

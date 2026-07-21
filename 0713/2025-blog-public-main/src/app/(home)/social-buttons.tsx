import { useCenterStore } from '@/hooks/use-center'
import GithubSVG from '@/svgs/github.svg'
import { CARD_SPACING, snapToHomeGrid } from '@/consts'
import { useConfigStore } from './stores/config-store'
import JuejinSVG from '@/svgs/juejin.svg'
import EmailSVG from '@/svgs/email.svg'
import XSVG from '@/svgs/x.svg'
import TgSVG from '@/svgs/tg.svg'
import WechatSVG from '@/svgs/wechat.svg'
import FacebookSVG from '@/svgs/facebook.svg'
import TiktokSVG from '@/svgs/tiktok.svg'
import InstagramSVG from '@/svgs/instagram.svg'
import WeiboSVG from '@/svgs/weibo.svg'
import XiaohongshuSVG from '@/svgs/小红书.svg'
import ZhihuSVG from '@/svgs/知乎.svg'
import BilibiliSVG from '@/svgs/哔哩哔哩.svg'
import QqSVG from '@/svgs/qq.svg'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { useEffect, useState, useMemo, useRef } from 'react'
import type React from 'react'
import { toast } from 'sonner'
import { useSize } from '@/hooks/use-size'
import { HomeDraggableLayer } from './home-draggable-layer'
import { createPortal } from 'react-dom'
import { withSiteBase } from '@/lib/site-path'
import { APPLE_EASE_OUT, FAST_FEEDBACK, PRESSABLE_HOVER, PRESSABLE_TAP, SHARED_TRANSITION, SPRING_LAYOUT } from '@/lib/motion'
import { useLayoutEditStore } from './stores/layout-edit-store'

type SocialButtonType =
	| 'github'
	| 'juejin'
	| 'email'
	| 'link'
	| 'x'
	| 'tg'
	| 'wechat'
	| 'facebook'
	| 'tiktok'
	| 'instagram'
	| 'weibo'
	| 'xiaohongshu'
	| 'zhihu'
	| 'bilibili'
	| 'qq'

const SOCIAL_BUTTON_LABELS: Record<SocialButtonType, string> = {
	github: '访问 GitHub',
	juejin: '访问掘金',
	email: '复制邮箱',
	link: '打开链接',
	x: '访问 X',
	tg: '访问 Telegram',
	wechat: '查看微信联系方式',
	facebook: '访问 Facebook',
	tiktok: '访问 TikTok',
	instagram: '访问 Instagram',
	weibo: '访问微博',
	xiaohongshu: '访问小红书',
	zhihu: '访问知乎',
	bilibili: '访问哔哩哔哩',
	qq: '查看 QQ 联系方式'
}

interface SocialButtonConfig {
	id: string
	type: SocialButtonType
	value: string
	label?: string
	order: number
}

const POPOVER_SIZE = 224

function getPopoverStyle(trigger: HTMLButtonElement | null) {
	if (!trigger || typeof window === 'undefined') {
		return { top: 0, left: 0, transformOrigin: '24px -8px' }
	}

	const rect = trigger.getBoundingClientRect()
	const left = Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - POPOVER_SIZE - 12))
	const placeAbove = rect.bottom + POPOVER_SIZE + 20 > window.innerHeight && rect.top > POPOVER_SIZE + 20
	const top = placeAbove ? rect.top - POPOVER_SIZE - 8 : rect.bottom + 8
	const originX = Math.max(16, Math.min(POPOVER_SIZE - 16, rect.left + rect.width / 2 - left))
	const originY = placeAbove ? POPOVER_SIZE + 8 : -8

	return { top, left, transformOrigin: `${originX}px ${originY}px` }
}

export default function SocialButtons() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const { maxLG, init } = useSize()
	const editingLayout = useLayoutEditStore(state => state.editing)
	const interactingLayout = useLayoutEditStore(state => state.interacting)
	const layoutInteraction = useLayoutEditStore(state => state.interaction)
	const reduceMotion = useReducedMotion()
	const styles = cardStyles.socialButtons
	const hiCardStyles = cardStyles.hiCard
	const isLayoutDragging = layoutInteraction?.cardKey === 'socialButtons' && (layoutInteraction.phase === 'dragging' || layoutInteraction.phase === 'resizing')

	const sortedButtons = useMemo(() => {
		const buttons = (siteContent.socialButtons || []) as SocialButtonConfig[]
		return [...buttons].sort((a, b) => a.order - b.order)
	}, [siteContent.socialButtons])

	const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})
	const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})
	const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as Node
			Object.keys(openDropdowns).forEach(buttonId => {
				if (openDropdowns[buttonId]) {
					const buttonRef = buttonRefs.current[buttonId]
					const dropdownRef = dropdownRefs.current[buttonId]
					if (buttonRef && !buttonRef.contains(target) && dropdownRef && !dropdownRef.contains(target)) {
						setOpenDropdowns(prev => ({ ...prev, [buttonId]: false }))
					}
				}
			})
		}

		if (Object.values(openDropdowns).some(Boolean)) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => {
				document.removeEventListener('mousedown', handleClickOutside)
			}
		}
	}, [openDropdowns])

	const x = styles.offsetX !== null ? center.x + styles.offsetX : snapToHomeGrid(center.x + hiCardStyles.width / 2 - styles.width)
	const y = styles.offsetY !== null ? center.y + styles.offsetY : snapToHomeGrid(center.y + hiCardStyles.height / 2 + CARD_SPACING)

	const iconMap: Record<SocialButtonType, React.ComponentType<{ className?: string }>> = {
		github: GithubSVG,
		juejin: JuejinSVG,
		email: EmailSVG,
		wechat: WechatSVG,
		x: XSVG,
		tg: TgSVG,
		facebook: FacebookSVG,
		tiktok: TiktokSVG,
		instagram: InstagramSVG,
		weibo: WeiboSVG,
		xiaohongshu: XiaohongshuSVG,
		zhihu: ZhihuSVG,
		bilibili: BilibiliSVG,
		qq: QqSVG,
		link: () => null
	}

	const renderButton = (button: SocialButtonConfig, index: number) => {
		const revealDelay = maxLG && init ? 0 : Math.min(0.12 + index * 0.03, 0.16)
		const commonProps = {
			initial: reduceMotion ? false : ({ opacity: 0, y: 4, scale: 0.98 } as const),
			animate: { opacity: 1, y: 0, scale: 1 } as const,
			whileHover: PRESSABLE_HOVER,
			whileTap: PRESSABLE_TAP,
			transition: reduceMotion
				? { duration: 0 }
				: { delay: revealDelay, opacity: FAST_FEEDBACK, y: SHARED_TRANSITION, scale: SHARED_TRANSITION }
		}

		const Icon = iconMap[button.type]
		const hasLabel = Boolean(button.label)
		const accessibleLabel = button.label?.trim() || SOCIAL_BUTTON_LABELS[button.type]
		const iconSize = hasLabel ? 'size-6' : 'size-8'

		if (button.type === 'github') {
			return (
				<motion.a
					key={button.id}
					href={button.value}
					target='_blank'
					rel='noreferrer'
					aria-label={accessibleLabel}
					title={accessibleLabel}
					{...commonProps}
					className='font-averia flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border bg-[#070707] px-3 py-1.5 text-xl text-white'
					style={{ boxShadow: ' inset 0 0 12px rgba(255, 255, 255, 0.4)' }}>
					<Icon className='size-8 shrink-0' />
					{hasLabel && button.label}
				</motion.a>
			)
		}

		if (button.type === 'email') {
			return (
				<motion.a
					key={button.id}
					href={`mailto:${button.value}`}
					aria-label={`发送邮件至 ${button.value}`}
					title={button.value}
					{...commonProps}
					className='text-primary flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/88 px-3 text-base font-medium shadow-sm'>
					<Icon className='size-8 shrink-0' />
					<span>Gmail</span>
				</motion.a>
			)
		}

		if (button.type === 'wechat' || button.type === 'qq') {
			const contactType = button.type
			const messageMap: Record<'wechat' | 'qq', string> = {
				wechat: '微信号已复制到剪贴板',
				qq: 'QQ号已复制到剪贴板'
			}

			const isImagePath = button.value.startsWith('/images/social-buttons/')
			const isOpen = openDropdowns[button.id] || false
			const popoverStyle = getPopoverStyle(buttonRefs.current[button.id] ?? null)

			if (isImagePath && (button.type === 'wechat' || button.type === 'qq')) {
				return (
					<div key={button.id} className='relative'>
						<motion.button
							type='button'
							ref={el => {
								buttonRefs.current[button.id] = el
							}}
							onClick={() => {
								setOpenDropdowns(prev => ({ ...prev, [button.id]: !prev[button.id] }))
							}}
							aria-label={accessibleLabel}
							title={accessibleLabel}
							{...commonProps}
							className='card btn relative rounded-xl p-1.5'>
							<Icon className='size-8' />
						</motion.button>
						{typeof window !== 'undefined' &&
							createPortal(
								<AnimatePresence>
									{isOpen && (
										<>
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												onClick={() => setOpenDropdowns(prev => ({ ...prev, [button.id]: false }))}
												className='fixed inset-0 z-40'
											/>
											<motion.div
												ref={el => {
													dropdownRefs.current[button.id] = el
												}}
												initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
												animate={{ opacity: 1, y: 0, scale: 1 }}
												exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -3, scale: 0.98 }}
												transition={{ duration: reduceMotion ? 0.12 : 0.18, ease: APPLE_EASE_OUT }}
												className='glass-panel glass-primary fixed z-50 rounded-[18px] border p-4'
												style={{
													...popoverStyle,
													boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
												}}>
												<img src={withSiteBase(button.value)} alt='QR Code' className='h-48 w-48 rounded-lg object-cover' />
											</motion.div>
										</>
									)}
								</AnimatePresence>,
								document.body
							)}
					</div>
				)
			}

			return (
				<motion.button
					key={button.id}
					type='button'
					onClick={() => {
						navigator.clipboard.writeText(button.value).then(() => {
							toast.success(messageMap[contactType])
						})
					}}
					aria-label={accessibleLabel}
					title={accessibleLabel}
					{...commonProps}
					className='card btn relative rounded-xl p-1.5'>
					<Icon className='size-8' />
				</motion.button>
			)
		}

		if (button.type === 'link') {
			return (
				<motion.a
					key={button.id}
					href={button.value}
					target='_blank'
					rel='noreferrer'
					aria-label={accessibleLabel}
					title={accessibleLabel}
					{...commonProps}
					className='card relative flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium whitespace-nowrap'>
					{hasLabel ? button.label : button.value}
				</motion.a>
			)
		}

		return (
			<motion.a
				key={button.id}
				href={button.value}
				target='_blank'
				rel='noreferrer'
				aria-label={accessibleLabel}
				title={accessibleLabel}
				{...commonProps}
				className={`card relative rounded-xl font-medium whitespace-nowrap ${hasLabel ? 'flex items-center gap-2 px-3 py-2.5' : 'p-1.5'}`}>
				<Icon className={iconSize} />
				{hasLabel && button.label}
			</motion.a>
		)
	}

	return (
		<HomeDraggableLayer cardKey='socialButtons' x={x} y={y} width={styles.width} height={styles.height}>
			<motion.div
				layout={editingLayout && !interactingLayout ? 'position' : false}
				layoutDependency={`${x}:${y}:${maxLG}`}
				transition={{ layout: SPRING_LAYOUT }}
				className={`${maxLG && init ? 'static' : 'absolute'} layout-interaction-target ${isLayoutDragging ? 'is-layout-dragging' : ''}`}
				style={{ left: x, top: y }}>
				<div className={`${maxLG && init ? 'static' : 'absolute'} top-0 left-0 flex flex-row-reverse items-center gap-3`} style={{ width: styles.width }}>
					{sortedButtons.map((button, index) => renderButton(button, index))}
				</div>
			</motion.div>
		</HomeDraggableLayer>
	)
}

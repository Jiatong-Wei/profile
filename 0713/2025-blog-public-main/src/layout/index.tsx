'use client'
import { PropsWithChildren, type CSSProperties } from 'react'
import { usePathname } from 'next/navigation'
import { useCenterInit, useCenterStore } from '@/hooks/use-center'
import { useAuthInit } from '@/hooks/use-auth'
import NavCard from '@/components/nav-card'
import { Toaster } from 'sonner'
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react'
import { useSize, useSizeInit } from '@/hooks/use-size'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { ScrollTopButton } from '@/components/scroll-top-button'
import MusicCard from '@/components/music-card'
import { MotionConfig } from 'motion/react'
import { RouteTransition } from '@/components/route-transition'
import { withoutSiteBase } from '@/lib/site-path'
import BlurredBubblesBackground from '@/layout/backgrounds/blurred-bubbles'

const HOME_LAYOUT_MIN_WIDTH = 900
const HOME_LAYOUT_NATURAL_WIDTH = 1054
const HOME_LAYOUT_CENTER_OFFSET = 35
const HOME_LAYOUT_SCALE_UNTIL = 1124
const HOME_LAYOUT_GUTTER = 16

function getBackgroundOpacity(pathname: string) {
	if (pathname === '/') return 0.7

	const isReadingPage = /^\/(?:blog|projects|wiki)\/[^/]+\/?$/.test(pathname) || /^\/cv\/?$/.test(pathname)
	return isReadingPage ? 0.35 : 0.5
}

export default function Layout({ children }: PropsWithChildren) {
	useCenterInit()
	useSizeInit()
	useAuthInit()
	const pathname = withoutSiteBase(usePathname() || '/')
	const { cardStyles, siteContent, regenerateKey } = useConfigStore()
	const { maxSM, maxXL, init } = useSize()
	const center = useCenterStore()
	const fitCompleteHomeLayout = pathname === '/' && init && center.width >= HOME_LAYOUT_MIN_WIDTH && center.width < HOME_LAYOUT_SCALE_UNTIL
	const homeLayoutScale = fitCompleteHomeLayout ? Math.min(1, (center.width - HOME_LAYOUT_GUTTER * 2) / HOME_LAYOUT_NATURAL_WIDTH) : 1
	const homeLayoutTranslateX = fitCompleteHomeLayout ? center.width / 2 - homeLayoutScale * (center.x + HOME_LAYOUT_CENTER_OFFSET) : 0
	const homeLayoutStyle = fitCompleteHomeLayout
		? ({
				transform: `translateX(${homeLayoutTranslateX}px) scale(${homeLayoutScale})`,
				transformOrigin: 'top left',
				minHeight: `${center.height / homeLayoutScale}px`
			}) satisfies CSSProperties
		: undefined

	const backgroundImages = (siteContent.backgroundImages ?? []) as Array<{ id: string; url: string }>
	const currentBackgroundImageId = siteContent.currentBackgroundImageId
	const currentBackgroundImage =
		currentBackgroundImageId && currentBackgroundImageId.trim()
			? backgroundImages.find(item => item.id === currentBackgroundImageId && item.url?.trim())
			: null
	const backgroundOpacity = getBackgroundOpacity(pathname)

	return (
		<MotionConfig reducedMotion='user'>
			<Toaster
				position='bottom-right'
				richColors
				icons={{
					success: <CircleCheckIcon className='size-4' />,
					info: <InfoIcon className='size-4' />,
					warning: <TriangleAlertIcon className='size-4' />,
					error: <OctagonXIcon className='size-4' />,
					loading: <Loader2Icon className='size-4 animate-spin' />
				}}
				style={
					{
						'--border-radius': '12px'
					} as React.CSSProperties
				}
			/>
			{currentBackgroundImage ? (
				<div
					className='pointer-events-none fixed top-0 left-0 z-0 overflow-hidden'
					aria-hidden='true'
					style={{
						width: '100vw',
						height: '100dvh',
						backgroundImage: `url(${currentBackgroundImage.url})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat'
					}}
				/>
			) : (
				<BlurredBubblesBackground
					colors={siteContent.backgroundColors}
					count={maxSM ? 3 : 6}
					opacity={backgroundOpacity}
					regenerateKey={regenerateKey}
					targetFps={6}
				/>
			)}
			<main className='site-main relative z-10 min-h-full' style={homeLayoutStyle}>
				<RouteTransition>{children}</RouteTransition>
				<NavCard />

				{!maxXL && cardStyles.musicCard?.enabled !== false && <MusicCard />}
			</main>

			{maxSM && init && <ScrollTopButton className='mobile-scroll-top fixed right-5 z-40 shadow-md' />}
		</MotionConfig>
	)
}

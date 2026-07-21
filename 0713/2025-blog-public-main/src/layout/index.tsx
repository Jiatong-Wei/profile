'use client'
import { PropsWithChildren } from 'react'
import { useCenterInit } from '@/hooks/use-center'
import NavCard from '@/components/nav-card'
import { Toaster } from 'sonner'
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react'
import { useSize, useSizeInit } from '@/hooks/use-size'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { ScrollTopButton } from '@/components/scroll-top-button'
import MusicCard from '@/components/music-card'
import { MotionConfig } from 'motion/react'
import { RouteTransition } from '@/components/route-transition'

export default function Layout({ children }: PropsWithChildren) {
	useCenterInit()
	useSizeInit()
	const { cardStyles, siteContent } = useConfigStore()
	const { maxSM, maxXL, init } = useSize()

	const backgroundImages = (siteContent.backgroundImages ?? []) as Array<{ id: string; url: string }>
	const currentBackgroundImageId = siteContent.currentBackgroundImageId
	const currentBackgroundImage =
		currentBackgroundImageId && currentBackgroundImageId.trim() ? backgroundImages.find(item => item.id === currentBackgroundImageId) : null

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
			{currentBackgroundImage && (
				<div
					className='fixed inset-0 z-0 overflow-hidden'
					style={{
						backgroundImage: `url(${currentBackgroundImage.url})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat'
					}}
				/>
			)}
			<main className='site-main relative z-10 min-h-full'>
				<RouteTransition>{children}</RouteTransition>
				<NavCard />

				{!maxXL && cardStyles.musicCard?.enabled !== false && <MusicCard />}
			</main>

			{maxSM && init && <ScrollTopButton className='mobile-scroll-top fixed right-5 z-40 shadow-md' />}
		</MotionConfig>
	)
}

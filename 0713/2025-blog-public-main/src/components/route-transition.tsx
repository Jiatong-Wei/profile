'use client'

import { AnimatePresence, LayoutGroup, motion, useIsPresent, useReducedMotion } from 'motion/react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { reducedRouteReveal, routeReveal } from '@/lib/motion'
import { withoutSiteBase } from '@/lib/site-path'

function RouteStage({ children }: { children: ReactNode }) {
	const isPresent = useIsPresent()
	const reduceMotion = useReducedMotion()

	return (
		<motion.div
			className='route-stage'
			variants={reduceMotion ? reducedRouteReveal : routeReveal}
			initial='hidden'
			animate='visible'
			exit='exit'
			aria-hidden={!isPresent}
			style={{ pointerEvents: isPresent ? 'auto' : 'none' }}>
			{children}
		</motion.div>
	)
}

export function RouteTransition({ children }: { children: ReactNode }) {
	const pathname = withoutSiteBase(usePathname() || '/')

	return (
		<LayoutGroup id='route-content'>
			<div className='route-stack'>
				<AnimatePresence mode='sync' initial={false}>
					<RouteStage key={pathname}>{children}</RouteStage>
				</AnimatePresence>
			</div>
		</LayoutGroup>
	)
}

import type { Transition, Variants } from 'motion/react'

export const APPLE_EASE_OUT = [0.22, 1, 0.36, 1] as const

export const FAST_FEEDBACK = {
	duration: 0.14,
	ease: APPLE_EASE_OUT
} satisfies Transition

export const SHARED_TRANSITION = {
	type: 'spring',
	duration: 0.32,
	bounce: 0
} satisfies Transition

export const SELECTION_SPRING = {
	type: 'spring',
	duration: 0.22,
	bounce: 0
} satisfies Transition

export const DRAG_SETTLE = {
	type: 'spring',
	duration: 0.32,
	bounce: 0.08
} satisfies Transition

export const SPRING_SNAPPY = {
	type: 'spring',
	stiffness: 500,
	damping: 36,
	mass: 0.8
} satisfies Transition

export const SPRING_LAYOUT = {
	type: 'spring',
	stiffness: 420,
	damping: 34,
	mass: 0.9
} satisfies Transition

export const SPRING_NAV = {
	type: 'spring',
	duration: 0.38,
	bounce: 0
} satisfies Transition

export const PRESSABLE_HOVER = {
	y: -1,
	scale: 1.01,
	transition: SPRING_SNAPPY
} as const

export const PRESSABLE_TAP = {
	scale: 0.97,
	transition: SPRING_SNAPPY
} as const

export const WINDOW_HOVER = {
	y: -1,
	scale: 1.008,
	transition: SPRING_SNAPPY
} as const

export const windowReveal = (delay = 0): Variants => ({
	hidden: { opacity: 0, y: 8, scale: 0.97 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			delay,
			opacity: { duration: 0.18, ease: APPLE_EASE_OUT },
			y: SPRING_SNAPPY,
			scale: SPRING_SNAPPY
		}
	}
})

export const pageReveal: Variants = {
	hidden: { opacity: 0, y: 4 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.18, ease: APPLE_EASE_OUT }
	},
	exit: {
		opacity: 0,
		y: -2,
		transition: { duration: 0.12, ease: APPLE_EASE_OUT }
	}
}

export const routeReveal: Variants = {
	hidden: { opacity: 0.46, y: 6 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			opacity: { duration: 0.26, ease: APPLE_EASE_OUT },
			y: { duration: 0.24, ease: APPLE_EASE_OUT }
		}
	},
	exit: {
		opacity: 0.08,
		y: -4,
		transition: {
			opacity: { duration: 0.2, ease: APPLE_EASE_OUT },
			y: { duration: 0.18, ease: APPLE_EASE_OUT }
		}
	}
}

export const reducedRouteReveal: Variants = {
	hidden: { opacity: 1 },
	visible: { opacity: 1 },
	exit: { opacity: 0, transition: { duration: 0 } }
}

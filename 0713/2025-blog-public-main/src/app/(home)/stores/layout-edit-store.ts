'use client'

import { create } from 'zustand'
import { useConfigStore, type CardStyles } from './config-store'

export type CardKey = keyof CardStyles
export type LayoutInteractionSource = 'pointer' | 'keyboard'
export type LayoutInteractionPhase = 'dragging' | 'resizing' | 'settling'

export type LayoutInteraction = {
	cardKey: CardKey
	source: LayoutInteractionSource
	phase: LayoutInteractionPhase
}

interface LayoutEditState {
	editing: boolean
	interacting: boolean
	interaction: LayoutInteraction | null
	snapshot: CardStyles | null
	startEditing: () => void
	cancelEditing: () => void
	saveEditing: () => void
	setInteraction: (interaction: LayoutInteraction | null) => void
	setOffset: (key: CardKey, offsetX: number | null, offsetY: number | null) => void
	setSize: (key: CardKey, width: number | undefined, height: number | undefined) => void
}

export const useLayoutEditStore = create<LayoutEditState>((set, get) => ({
	editing: false,
	interacting: false,
	interaction: null,
	snapshot: null,
	startEditing: () => {
		const { cardStyles } = useConfigStore.getState()
		set({
			editing: true,
			interacting: false,
			interaction: null,
			snapshot: { ...cardStyles }
		})
	},
	cancelEditing: () => {
		const { snapshot } = get()
		if (!snapshot) {
			set({ editing: false, interacting: false, interaction: null, snapshot: null })
			return
		}

		const { setCardStyles } = useConfigStore.getState()
		setCardStyles(snapshot)

		set({
			editing: false,
			interacting: false,
			interaction: null,
			snapshot: null
		})
	},
	saveEditing: () => {
		set({
			editing: false,
			interacting: false,
			interaction: null,
			snapshot: null
		})
	},
	setInteraction: interaction =>
		set({
			interaction,
			interacting: interaction !== null && interaction.phase !== 'settling'
		}),
	setOffset: (key, offsetX, offsetY) => {
		const { cardStyles, setCardStyles } = useConfigStore.getState()

		const next: CardStyles = {
			...cardStyles,
			[key]: {
				...cardStyles[key],
				offsetX,
				offsetY
			}
		}

		setCardStyles(next)
	},
	setSize: (key, width, height) => {
		const { cardStyles, setCardStyles } = useConfigStore.getState()

		const next: CardStyles = {
			...cardStyles,
			[key]: {
				...cardStyles[key],
				width,
				height
			}
		}

		setCardStyles(next)
	}
}))

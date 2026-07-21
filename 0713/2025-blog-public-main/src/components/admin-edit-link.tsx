'use client'

import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { useAdminSession } from '@/hooks/use-admin-session'

type AdminEditLinkProps = {
	href: string
	label: string
}

export function AdminEditLink({ href, label }: AdminEditLinkProps) {
	const isAuth = useAdminSession()

	if (!isAuth) return null

	return (
		<Link
			href={href}
			aria-label={label}
			title={label}
			className='glass-panel glass-quiet pressable-icon text-secondary hover:text-primary fixed top-24 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-xl transition-colors max-sm:hidden'>
			<Pencil size={16} aria-hidden='true' />
		</Link>
	)
}

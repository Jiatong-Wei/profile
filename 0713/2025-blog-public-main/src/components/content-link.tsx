import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'
import { withSiteBase, withoutSiteBase } from '@/lib/site-path'

const externalHrefPattern = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i

export function isExternalContentHref(href: string) {
	return externalHrefPattern.test(href)
}

type ContentLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
	href: string
}

export function ContentLink({ href, children, target, rel, ...props }: ContentLinkProps) {
	const resolvedHref = href || '#'
	const external = isExternalContentHref(resolvedHref)

	if (external || resolvedHref.startsWith('#')) {
		return (
			<a href={resolvedHref} target={external ? target || '_blank' : target} rel={external ? rel || 'noreferrer' : rel} {...props}>
				{children}
			</a>
		)
	}

	return (
		<Link href={withoutSiteBase(withSiteBase(resolvedHref))} target={target} rel={rel} {...props}>
			{children}
		</Link>
	)
}

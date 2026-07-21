import blogIndex from '@/../public/blogs/index.json'
import ClientPage from './client-page'

export const dynamicParams = false

export function generateStaticParams() {
	return (blogIndex as Array<{ slug: string }>).filter(item => item.slug).map(item => ({ slug: item.slug }))
}

export default function WriteDetailPage() {
	return <ClientPage />
}

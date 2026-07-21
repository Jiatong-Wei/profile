import type { ReadingStats } from '@/lib/reading-stats'

type ArticleReadingStatsProps = {
	stats: ReadingStats
}

export function ArticleReadingStats({ stats }: ArticleReadingStatsProps) {
	return (
		<span className='article-reading-stats' aria-label={`全文共计 ${stats.wordCount} 字，预计阅读时长 ${stats.readingMinutes} 分钟`}>
			全文共计 {stats.wordCount.toLocaleString('zh-CN')} 字，阅读时长 {stats.readingMinutes} 分钟
		</span>
	)
}

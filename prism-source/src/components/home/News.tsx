'use client';

import { motion } from 'framer-motion';
import { useMessages } from '@/lib/i18n/useMessages';

export interface NewsItem {
    date: string;
    content: string;
}

interface NewsProps {
    items: NewsItem[];
    title?: string;
}

export default function News({ items, title }: NewsProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.news;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
        >
            <h2 className="text-2xl font-serif font-bold text-primary mb-5">{resolvedTitle}</h2>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 * index }}
                        className="flex items-start space-x-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors duration-200"
                    >
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-500 mt-0.5 w-16 flex-shrink-0 tabular-nums">{item.date}</span>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{item.content}</p>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}

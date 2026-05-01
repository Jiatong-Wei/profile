'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useMessages } from '@/lib/i18n/useMessages';

interface AboutProps {
    content: string;
    title?: string;
}

export default function About({ content, title }: AboutProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.about;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="elevated-panel rounded-2xl p-6 md:p-8"
        >
            <h2 className="text-3xl font-serif font-bold text-primary mb-6 tracking-tight">{resolvedTitle}</h2>
            <div className="text-neutral-700 dark:text-neutral-300 leading-[1.8]">
                <ReactMarkdown
                    components={{
                        h1: ({ children }) => <h1 className="text-2xl font-serif font-bold text-primary mt-8 mb-4">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-serif font-bold text-primary mt-7 mb-4 border-b border-neutral-200/60 dark:border-neutral-700/60 pb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-semibold text-primary mt-6 mb-3">{children}</h3>,
                        p: ({ children }) => <p className="mb-4 last:mb-0 leading-[1.8]">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-outside mb-4 space-y-2 ml-5">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-outside mb-4 space-y-2 ml-5">{children}</ol>,
                        li: ({ children }) => <li className="pl-1">{children}</li>,
                        a: ({ ...props }) => (
                            <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
                            />
                        ),
                        blockquote: ({ children }) => (
                            <blockquote className="my-5 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-5 py-4 text-foreground font-medium leading-relaxed shadow-sm">
                                {children}
                            </blockquote>
                        ),
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        em: ({ children }) => <em className="italic text-neutral-600 dark:text-neutral-400">{children}</em>,
                        code: ({ children }) => (
                            <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-sm font-mono text-primary">
                                {children}
                            </code>
                        ),
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </motion.section>
    );
}

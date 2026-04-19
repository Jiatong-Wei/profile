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
            <h2 className="text-3xl font-serif font-bold text-primary mb-5 tracking-tight">{resolvedTitle}</h2>
            <div className="text-neutral-700 dark:text-neutral-500 leading-relaxed">
                <ReactMarkdown
                    components={{
                        h1: ({ children }) => <h1 className="text-3xl font-serif font-bold text-primary mt-8 mb-4">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-2xl font-serif font-bold text-primary mt-8 mb-4 border-b border-neutral-200/80 dark:border-neutral-700/80 pb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xl font-semibold text-primary mt-6 mb-3">{children}</h3>,
                        p: ({ children }) => <p className="mb-4 last:mb-0 text-[1.02rem] leading-8">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1.5 ml-4">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1.5 ml-4">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        a: ({ ...props }) => (
                            <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
                            />
                        ),
                        blockquote: ({ children }) => (
                            <blockquote className="my-5 rounded-xl border border-accent/35 bg-accent/8 px-4 py-3 md:px-5 md:py-4 text-primary dark:text-neutral-100 font-medium leading-relaxed shadow-sm">
                                {children}
                            </blockquote>
                        ),
                        strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                        em: ({ children }) => <em className="italic text-neutral-600 dark:text-neutral-500">{children}</em>,
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </motion.section>
    );
}

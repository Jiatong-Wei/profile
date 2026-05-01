'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Publication } from '@/types/publication';
import { useMessages } from '@/lib/i18n/useMessages';
import { BookOpen, ArrowRight } from 'lucide-react';

interface SelectedPublicationsProps {
    publications: Publication[];
    title?: string;
    enableOnePageMode?: boolean;
}

const ACCENT = '#8b5cf6'; // violet for academic

export default function SelectedPublications({ publications, title, enableOnePageMode = false }: SelectedPublicationsProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.selectedPublications;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-primary tracking-tight">{resolvedTitle}</h2>
                <Link
                    href={enableOnePageMode ? '/#publications' : '/publications'}
                    prefetch={true}
                    className="text-accent hover:text-primary text-sm font-medium transition-all duration-200 rounded-lg px-3 py-1.5 hover:bg-accent/10 flex items-center gap-1"
                >
                    {messages.home.viewAll} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="space-y-4">
                {publications.map((pub, index) => (
                    <motion.div
                        key={pub.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.08 * index }}
                    >
                        <div
                            className={`
                                group relative flex gap-4 sm:gap-5 p-5 rounded-2xl
                                border border-neutral-200/60 dark:border-neutral-700/50
                                bg-white/[0.02] dark:bg-white/[0.015]
                                backdrop-blur-sm
                                transition-all duration-300 ease-out
                                hover:border-neutral-300/70 dark:hover:border-neutral-600/60
                                hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-black/30
                                hover:-translate-y-0.5
                                cursor-default
                            `}
                            style={{
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.04)',
                            }}
                        >
                            {/* Left accent bar */}
                            <div
                                className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full transition-all duration-300 group-hover:top-3 group-hover:bottom-3 group-hover:w-[4px]"
                                style={{ backgroundColor: ACCENT }}
                            />

                            {/* Icon */}
                            <div className="hidden sm:flex flex-col items-center pt-0.5">
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                                    style={{
                                        backgroundColor: `${ACCENT}14`,
                                        border: `1px solid ${ACCENT}26`,
                                    }}
                                >
                                    <BookOpen className="w-5 h-5" style={{ color: ACCENT }} />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                {/* Title */}
                                <h3 className="font-semibold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors duration-200 flex items-start gap-2">
                                    <BookOpen className="sm:hidden w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
                                    {pub.title}
                                </h3>

                                {/* Authors */}
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 leading-relaxed">
                                    {pub.authors.map((author, idx) => (
                                        <span key={idx}>
                                            <span
                                                className={`${
                                                    author.isHighlighted
                                                        ? 'font-semibold text-accent'
                                                        : ''
                                                } ${
                                                    author.isCoAuthor
                                                        ? `underline underline-offset-4 ${
                                                              author.isHighlighted
                                                                  ? 'decoration-accent'
                                                                  : 'decoration-neutral-400'
                                                          }`
                                                        : ''
                                                }`}
                                            >
                                                {author.name}
                                            </span>
                                            {author.isCorresponding && (
                                                <sup
                                                    className={`ml-0.5 ${
                                                        author.isHighlighted
                                                            ? 'text-accent'
                                                            : 'text-neutral-500 dark:text-neutral-500'
                                                    }`}
                                                >
                                                    †
                                                </sup>
                                            )}
                                            {idx < pub.authors.length - 1 && ', '}
                                        </span>
                                    ))}
                                </p>

                                {/* Venue */}
                                <p
                                    className="text-sm font-medium mb-2 inline-block px-2.5 py-1 rounded-full border"
                                    style={{
                                        color: ACCENT,
                                        backgroundColor: `${ACCENT}10`,
                                        borderColor: `${ACCENT}20`,
                                    }}
                                >
                                    {pub.journal || pub.conference}
                                </p>

                                {/* Description */}
                                {pub.description && (
                                    <p className="text-sm text-neutral-500 dark:text-neutral-500 line-clamp-2 leading-relaxed mt-1.5">
                                        {pub.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}

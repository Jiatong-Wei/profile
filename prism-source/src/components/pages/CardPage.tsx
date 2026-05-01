'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { CardPageConfig } from '@/types/page';
import {
    Wrench,
    FlaskConical,
    Award,
    Trophy,
    Medal,
    Code2,
    Bot,
    Ship,
    Tractor,
    Boxes,
    Palette,
    Calculator,
    Globe,
    Cpu,
    Microscope,
    Lightbulb,
    Rocket,
    ExternalLink,
    FolderOpen,
} from 'lucide-react';

/* ---------- icon registry ---------- */
const iconMap: Record<string, React.ElementType> = {
    engineering: Wrench,
    scientific: FlaskConical,
    award: Award,
    competition: Trophy,
    prize: Medal,
    code: Code2,
    robotics: Bot,
    robot: Bot,
    underwater: Ship,
    ship: Ship,
    agriculture: Tractor,
    logistics: Boxes,
    design: Palette,
    modeling: Calculator,
    math: Calculator,
    international: Globe,
    control: Cpu,
    research: Microscope,
    innovation: Lightbulb,
    rocket: Rocket,
};

function pickIcon(title: string, tags: string[] = []): React.ElementType {
    const hay = (title + ' ' + tags.join(' ')).toLowerCase();
    for (const [key, Icon] of Object.entries(iconMap)) {
        if (hay.includes(key)) return Icon;
    }
    return FolderOpen;
}

/* ---------- accent color by category ---------- */
function pickAccent(tags: string[] = []): string {
    const t = tags.join(' ').toLowerCase();
    if (t.includes('engineering') || t.includes('robotics') || t.includes('control')) return '#0ea5e9'; // sky
    if (t.includes('scientific') || t.includes('research') || t.includes('national project')) return '#8b5cf6'; // violet
    if (t.includes('design') || t.includes('creative') || t.includes('ue5')) return '#ec4899'; // pink
    if (t.includes('mathematical') || t.includes('modeling')) return '#10b981'; // emerald
    if (t.includes('first prize') || t.includes('grand prize')) return '#f59e0b'; // amber
    return '#d97706'; // primary orange fallback
}

/* ---------- markdown components ---------- */
const markdownComponents = {
    p: ({ children }: React.ComponentProps<'p'>) => <p className="mb-2 last:mb-0">{children}</p>,
    ul: ({ children }: React.ComponentProps<'ul'>) => (
        <ul className="list-none mb-2 space-y-1.5">{children}</ul>
    ),
    ol: ({ children }: React.ComponentProps<'ol'>) => (
        <ol className="list-decimal list-outside mb-2 space-y-1.5 ml-5">{children}</ol>
    ),
    li: ({ children }: React.ComponentProps<'li'>) => (
        <li className="relative pl-4 text-sm leading-relaxed">
            <span className="absolute left-0 top-[0.55em] w-1 h-1 rounded-full bg-primary/60" />
            {children}
        </li>
    ),
    a: ({ ...props }) => (
        <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
        />
    ),
    blockquote: ({ children }: React.ComponentProps<'blockquote'>) => (
        <blockquote className="border-l-4 border-accent/50 pl-4 italic my-4 text-neutral-600 dark:text-neutral-500">
            {children}
        </blockquote>
    ),
    strong: ({ children }: React.ComponentProps<'strong'>) => (
        <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }: React.ComponentProps<'em'>) => (
        <em className="italic text-neutral-600 dark:text-neutral-400">{children}</em>
    ),
    code: ({ children }: React.ComponentProps<'code'>) => (
        <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[0.95em]">{children}</code>
    ),
    img: ({ alt, ...props }: React.ComponentProps<'img'>) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img {...props} alt={alt || ''} loading="lazy" className="mt-3 rounded-lg border border-neutral-200/80 dark:border-neutral-700/80 max-h-48 w-auto object-contain" />
    ),
};

/* ---------- component ---------- */
export default function CardPage({ config, embedded = false }: { config: CardPageConfig; embedded?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            {/* Header */}
            <div className={embedded ? 'mb-6' : 'mb-8'}>
                <h1 className={`${embedded ? 'text-2xl' : 'text-4xl'} font-serif font-bold text-primary mb-3 tracking-tight`}>
                    {config.title}
                </h1>
                {config.description && (
                    <div className={`${embedded ? 'text-base' : 'text-lg'} text-neutral-600 dark:text-neutral-500 max-w-2xl leading-relaxed`}>
                        <ReactMarkdown components={markdownComponents}>
                            {config.description}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            {/* Cards */}
            <div className={`grid ${embedded ? 'gap-4' : 'gap-5'}`}>
                {config.items.map((item, index) => {
                    const Icon = pickIcon(item.title, item.tags);
                    const accent = pickAccent(item.tags);
                    const CardWrapper = item.link ? 'a' : 'div';
                    const wrapperProps = item.link
                        ? {
                              href: item.link,
                              target: '_blank',
                              rel: 'noopener noreferrer',
                          }
                        : {};

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.08 * index }}
                        >
                            <CardWrapper
                                {...wrapperProps}
                                className={`
                                    group relative flex flex-col sm:flex-row gap-4 sm:gap-5
                                    ${embedded ? 'p-4' : 'p-5'}
                                    rounded-2xl border border-neutral-200/60 dark:border-neutral-700/50
                                    bg-white/[0.02] dark:bg-white/[0.015]
                                    backdrop-blur-sm
                                    transition-all duration-300 ease-out
                                    hover:border-neutral-300/70 dark:hover:border-neutral-600/60
                                    hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-black/30
                                    hover:-translate-y-0.5
                                    ${item.link ? 'cursor-pointer' : ''}
                                `}
                                style={{
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.04)',
                                }}
                            >
                                {/* Left accent bar */}
                                <div
                                    className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full transition-all duration-300 group-hover:top-3 group-hover:bottom-3 group-hover:w-[4px]"
                                    style={{ backgroundColor: accent }}
                                />

                                {/* Icon */}
                                <div className="hidden sm:flex flex-col items-center pt-1">
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                                        style={{
                                            backgroundColor: `${accent}14`,
                                            border: `1px solid ${accent}26`,
                                        }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: accent }} />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {/* Title row */}
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {/* Mobile icon */}
                                            <div
                                                className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{
                                                    backgroundColor: `${accent}14`,
                                                    border: `1px solid ${accent}26`,
                                                }}
                                            >
                                                <Icon className="w-4 h-4" style={{ color: accent }} />
                                            </div>
                                            <h3
                                                className={`${embedded ? 'text-base' : 'text-lg'} font-semibold text-foreground truncate transition-colors duration-200 group-hover:text-primary`}
                                            >
                                                {item.title}
                                            </h3>
                                            {item.link && (
                                                <ExternalLink className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 mt-1" />
                                            )}
                                        </div>

                                        {item.date && (
                                            <span
                                                className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 border"
                                                style={{
                                                    color: accent,
                                                    backgroundColor: `${accent}10`,
                                                    borderColor: `${accent}20`,
                                                }}
                                            >
                                                {item.date}
                                            </span>
                                        )}
                                    </div>

                                    {/* Subtitle */}
                                    {item.subtitle && (
                                        <p className="text-sm font-medium mb-2.5" style={{ color: accent }}>
                                            {item.subtitle}
                                        </p>
                                    )}

                                    {/* Content */}
                                    {item.content && (
                                        <div className="text-sm text-neutral-600 dark:text-neutral-400 leading-[1.75]">
                                            <ReactMarkdown components={markdownComponents}>
                                                {item.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-3.5">
                                            {item.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full transition-colors duration-200"
                                                    style={{
                                                        color: `${accent}cc`,
                                                        backgroundColor: `${accent}0d`,
                                                        border: `1px solid ${accent}18`,
                                                    }}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardWrapper>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

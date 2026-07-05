import Link from "next/link";

interface TagPillProps {
  tag: string;
  count?: number;
}

export function TagPill({ tag, count }: TagPillProps) {
  return (
    <Link className="tag-pill" href={`/tags/${encodeURIComponent(tag)}`}>
      <span>{tag}</span>
      {typeof count === "number" ? <strong>{count}</strong> : null}
    </Link>
  );
}

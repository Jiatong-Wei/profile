import type { ContentStatus } from "@/lib/types";

const statusLabels: Record<ContentStatus, string> = {
  seed: "Seed",
  growing: "Growing",
  evergreen: "Evergreen",
  "in-progress": "In progress",
  submitted: "Submitted",
  published: "Published",
  archived: "Archived"
};

export function StatusBadge({ status }: { status?: ContentStatus }) {
  if (!status) {
    return null;
  }

  return <span className={`status-badge status-${status}`}>{statusLabels[status]}</span>;
}

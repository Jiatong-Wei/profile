import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Papers",
  description: "Papers are coming."
};

export default function PapersPage() {
  return (
    <section className="empty-page">
      <PageHero
        eyebrow="Papers"
        title="Papers"
        summary="Papers are coming~"
      />
    </section>
  );
}

import { Download } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { PageHero } from "@/components/page-hero";
import { getCvMarkdown } from "@/lib/content";

export const metadata = {
  title: "CV",
  description: "Jiatong Wei 的简洁 CV 页面。"
};

export default function CvPage() {
  return (
    <>
      <PageHero
        eyebrow="CV"
        title="正式信息入口"
        summary="为申请材料保留一个清晰、可打印、低干扰的页面。"
      >
        <a className="secondary-action" href="mailto:weijiatong@mail.nwpu.edu.cn">
          <Download aria-hidden="true" size={18} />
          Request PDF CV
        </a>
      </PageHero>
      <section className="section-band">
        <div className="cv-sheet">
          <MarkdownRenderer content={getCvMarkdown()} />
        </div>
      </section>
    </>
  );
}

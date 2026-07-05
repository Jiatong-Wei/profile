import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-hero not-found">
      <p className="eyebrow">404</p>
      <h1>这个节点还没有公开</h1>
      <p>它可能是私人笔记，也可能还没有被整理到公开知识库里。</p>
      <Link className="primary-action" href="/wiki">
        Back to Wiki
      </Link>
    </section>
  );
}

import Link from "next/link";
import { navItems, SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand-mark" href="/" aria-label="Go to home">
        <span className="brand-spark" />
        <span>{SITE.shortName}</span>
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link href={item.href} key={item.href}>
              <Icon aria-hidden="true" size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

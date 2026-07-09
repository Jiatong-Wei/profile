import Image from "next/image";
import Link from "next/link";
import { navItems, SITE, withBasePath } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand-mark" href="/" aria-label="Go to home">
        <Image
          className="brand-logo"
          src={withBasePath("/icons/icon.png")}
          alt=""
          width={28}
          height={28}
          priority
        />
        <span>{SITE.shortName}</span>
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;

          if ("download" in item && item.download) {
            return (
              <a href={withBasePath(item.href)} download key={item.href}>
                <Icon aria-hidden="true" size={16} />
                <span>{item.label}</span>
              </a>
            );
          }

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

import { contactItems, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="eyebrow">Personal Wiki</p>
        <p>
          Built as a bright, content-first map of projects, papers, and notes.
        </p>
      </div>
      <div className="footer-links">
        {contactItems.map((item) => {
          const Icon = item.icon;
          const isExternal = /^https?:\/\//.test(item.href);
          const linkProps = isExternal
            ? { target: "_blank", rel: "noreferrer" }
            : {};

          return (
            <a href={item.href} key={item.href} {...linkProps}>
              <Icon aria-hidden="true" size={16} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>
      <p className="footer-small">© 2026 {SITE.shortName}. Static site under /profile.</p>
    </footer>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { SiteContent } from "@/lib/site-content";

type SiteHeaderProps = {
  activePage: "home" | "about";
  links?: SiteContent["navLinks"];
};

export function SiteHeader({ activePage, links = [] }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand-link" aria-label="Piriyapul International home">
          <Image
            src="/assets/logo-text.png"
            alt="Piriyapul International"
            width={2172}
            height={724}
            priority
          />
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => {
            const active =
              (link.id === "home" && activePage === "home") ||
              (link.id === "about" && activePage === "about");

            return (
              <Link
                key={link.id}
                href={link.href}
                className={active ? "nav-link active" : "nav-link"}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <details className="mobile-nav">
          <summary aria-label="Open navigation menu">
            <span />
            <span />
            <span />
          </summary>
          <nav aria-label="Mobile navigation">
            {links.map((link) => (
              <Link key={link.id} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}

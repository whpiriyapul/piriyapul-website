import Image from "next/image";
import Link from "next/link";
import type { SiteContent } from "@/lib/site-content";

export function SiteFooter({ content, links = [] }: { content: SiteContent["footer"]; links?: SiteContent["navLinks"] }) {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-main">
        <Link href="/" className="footer-brand" aria-label="Piriyapul International home">
          <Image
            src="/assets/logo-text.png"
            alt="Piriyapul International"
            width={2172}
            height={724}
          />
        </Link>
        <nav className="footer-nav" aria-label="Footer navigation">
          {links.map((link) => (
            <Link href={link.href} key={link.id}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="social-icons" aria-label="Social media">
          {content.socials.map((social) => (
            <a className="social-icon" key={social.label} href={social.href} aria-label={social.label} target="_blank" rel="noreferrer">
              <img src={social.image.src} alt={social.image.alt || social.label} />
            </a>
          ))}
        </div>
      </div>
      <div className="copyright">{content.copyright}</div>
    </footer>
  );
}

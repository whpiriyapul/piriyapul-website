import Image from "next/image";
import Link from "next/link";
import type { SiteContent } from "@/lib/site-content";

export function HomeIntro({ content }: { content: SiteContent["homeIntro"] }) {
  return (
    <section className="home-intro" aria-labelledby="home-intro-title">
      <div className="intro-inner">
        <div className="intro-copy">
          <h1 id="home-intro-title">{content.title}</h1>
          {content.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          <Link className="read-more-link" href={content.buttonHref} aria-label="Read more about Piriyapul International">
            <Image src="/assets/read-more.png" alt="READ MORE" width={631} height={143} />
          </Link>
        </div>
        <img className="intro-seal" src={content.seal.src} alt={content.seal.alt} />
      </div>
    </section>
  );
}

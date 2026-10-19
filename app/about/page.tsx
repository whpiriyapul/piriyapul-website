import type { Metadata } from "next";
import { AboutHero } from "@/components/HeroCarousel";
import { ShoppingBanner } from "@/components/ShoppingBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ValueProps } from "@/components/ValueProps";
import { getPublishedSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Piriyapul International, a trusted importer and distributor of premium consumer goods in Thailand.",
};

export default async function AboutPage() {
  const content = await getPublishedSiteContent();

  return (
    <>
      <SiteHeader activePage="about" links={content.navLinks} />
      <main className="about-page">
        <AboutHero hero={content.about.hero} />
        <section className="about-profile" aria-labelledby="about-title">
          <div className="profile-inner">
            <div className="profile-copy">
              <h1 id="about-title">{content.about.title}</h1>
              <p>{content.about.intro}</p>
              <p>{content.about.body}</p>
              <ul>{content.about.categories.map((category, index) => <li key={`${index}-${category}`}>{category}</li>)}</ul>
              {content.about.closing.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
            <img
              className="about-building"
              src={content.about.building.src}
              alt={content.about.building.alt}
            />
          </div>
        </section>
        <ShoppingBanner content={content.shop} />
        <ValueProps values={content.values} />
      </main>
      <SiteFooter content={content.footer} links={content.navLinks} />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AboutHero, HeroCarousel } from "@/components/HeroCarousel";
import { HomeIntro } from "@/components/HomeIntro";
import { ProductShowcase } from "@/components/ProductShowcase";
import { ShoppingBanner } from "@/components/ShoppingBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ValueProps } from "@/components/ValueProps";
import type { CatalogBrand, CatalogCategory } from "@/lib/catalog";
import type { SiteContent } from "@/lib/site-content";

type PreviewPage = "home" | "about";

export function SiteContentPreview({
  initialContent,
  categories,
  brands,
}: {
  initialContent: SiteContent;
  categories: CatalogCategory[];
  brands: CatalogBrand[];
}) {
  const [content, setContent] = useState(initialContent);
  const [page, setPage] = useState<PreviewPage>("home");
  const [selectedSection, setSelectedSection] = useState("hero");

  useEffect(() => {
    const parentOrigin = window.location.origin;
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== parentOrigin || event.source !== window.parent || !event.data) return;
      if (event.data.type === "piriyapul:preview") {
        if (event.data.content && typeof event.data.content === "object") setContent(event.data.content as SiteContent);
        if (event.data.page === "home" || event.data.page === "about") setPage(event.data.page);
        if (typeof event.data.selectedSection === "string") setSelectedSection(event.data.selectedSection);
      }
    };
    window.addEventListener("message", handleMessage);
    window.parent.postMessage({ type: "piriyapul:preview-ready" }, parentOrigin);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function selectSection(event: React.MouseEvent<HTMLDivElement>) {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-cms-section]");
    if (!target) return;
    const anchor = (event.target as HTMLElement).closest("a");
    if (anchor) event.preventDefault();
    const section = target.dataset.cmsSection;
    if (section) window.parent.postMessage({ type: "piriyapul:select-section", section }, window.location.origin);
  }

  const section = (id: string, children: React.ReactNode) => (
    <div className="cms-preview-target" data-cms-section={id} data-cms-active={selectedSection === id ? "true" : "false"}>
      {children}
    </div>
  );

  return (
    <div className="cms-preview-frame" onClickCapture={selectSection}>
      {page === "home" ? (
        <>
          {section("navigation", <SiteHeader activePage="home" links={content.navLinks} />)}
          <main>
            {section("hero", <HeroCarousel hero={content.hero} />)}
            {section("homeIntro", <HomeIntro content={content.homeIntro} />)}
            {section("products", <ProductShowcase categories={categories} brands={brands} title={content.productsTitle} />)}
            {section("shop", <ShoppingBanner content={content.shop} />)}
            {section("values", <ValueProps values={content.values} />)}
          </main>
          {section("footer", <SiteFooter content={content.footer} links={content.navLinks} />)}
        </>
      ) : (
        <>
          {section("navigation", <SiteHeader activePage="about" links={content.navLinks} />)}
          <main className="about-page">
            {section("aboutHero", <AboutHero hero={content.about.hero} />)}
            {section("about", (
              <section className="about-profile" aria-labelledby="about-title">
                <div className="profile-inner">
                  <div className="profile-copy">
                    <h1 id="about-title">{content.about.title}</h1>
                    <p>{content.about.intro}</p>
                    <p>{content.about.body}</p>
                    <ul>{content.about.categories.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
                    {content.about.closing.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                  </div>
                  <img className="about-building" src={content.about.building.src} alt={content.about.building.alt} />
                </div>
              </section>
            ))}
            {section("shop", <ShoppingBanner content={content.shop} />)}
            {section("values", <ValueProps values={content.values} />)}
          </main>
          {section("footer", <SiteFooter content={content.footer} links={content.navLinks} />)}
        </>
      )}
    </div>
  );
}

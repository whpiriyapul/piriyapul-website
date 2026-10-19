import { HeroCarousel } from "@/components/HeroCarousel";
import { HomeIntro } from "@/components/HomeIntro";
import { ProductShowcase } from "@/components/ProductShowcase";
import { ShoppingBanner } from "@/components/ShoppingBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ValueProps } from "@/components/ValueProps";
import { getProductCatalog } from "@/lib/catalog";
import { getPublishedSiteContent } from "@/lib/site-content";

export default async function HomePage() {
  const [catalog, content] = await Promise.all([getProductCatalog(), getPublishedSiteContent()]);

  return (
    <>
      <SiteHeader activePage="home" links={content.navLinks} />
      <main>
        <HeroCarousel hero={content.hero} />
        <HomeIntro content={content.homeIntro} />

        <ProductShowcase categories={catalog.categories} brands={catalog.brands} title={content.productsTitle} />
        <ShoppingBanner content={content.shop} />
        <ValueProps values={content.values} />
      </main>
      <SiteFooter content={content.footer} links={content.navLinks} />
    </>
  );
}

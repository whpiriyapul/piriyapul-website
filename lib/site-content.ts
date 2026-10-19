import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { Json } from "@/lib/supabase/database.types";

export type SiteNavLink = { id: string; label: string; href: string };
export type SiteImage = { src: string; alt: string };
export type SiteImageSlide = { id: string; src: string; alt: string };

export type SiteContent = {
  navLinks: SiteNavLink[];
  hero: {
    slides: SiteImageSlide[];
  };
  homeIntro: {
    title: string;
    paragraphs: string[];
    buttonHref: string;
    seal: SiteImage;
  };
  productsTitle: string;
  about: {
    hero: { slides: SiteImageSlide[] };
    title: string;
    intro: string;
    body: string;
    categories: string[];
    closing: string[];
    building: SiteImage;
  };
  shop: {
    buttonHref: string;
    groups: {
      id: string;
      name: string;
      logo: SiteImage;
      links: { id: string; label: string; href: string; image: SiteImage }[];
    }[];
  };
  values: { title: string; caption: string; icon: "globe" | "shield" | "truck" }[];
  footer: {
    copyright: string;
    socials: { label: string; href: string; image: SiteImage }[];
  };
};

export const defaultSiteContent: SiteContent = {
  navLinks: [
    { id: "home", label: "Home", href: "/" },
    { id: "about", label: "About Us", href: "/about" },
    { id: "products", label: "Product", href: "/#products" },
    { id: "shops", label: "Our Shop", href: "/#our-shop" },
    { id: "contact", label: "Contact Us", href: "/#contact" },
  ],
  hero: {
    slides: [
      { id: "living", src: "/assets/hero-living.png", alt: "Premium food, coffee and confectionery for the living room" },
      { id: "kitchen", src: "/assets/hero-kitchen.png", alt: "Premium imported products in a warm kitchen" },
      { id: "bathroom", src: "/assets/hero-bathroom.png", alt: "Personal care products arranged in a bright bathroom" },
    ],
  },
  homeIntro: {
    title: "PIRIYAPUL INTERNATIONAL",
    paragraphs: [
      "is a leading importer and distributor of premium Fast-Moving Consumer Goods (FMCG) in Thailand.",
      "Backed by over 50 years of expertise and a commitment to continuous development, ...",
    ],
    buttonHref: "/about",
    seal: { src: "/assets/company-seal.png", alt: "Piriyapul" },
  },
  productsTitle: "OUR PRODUCTS",
  about: {
    hero: {
      slides: [
        { id: "about-bathroom", src: "/assets/hero-bathroom.png", alt: "Premium personal care products in a bright bathroom" },
      ],
    },
    title: "PIRIYAPUL INTERNATIONAL",
    intro: "is a leading importer and distributor of premium Fast-Moving Consumer Goods (FMCG) in Thailand.",
    body: "Backed by over 50 years of expertise and a commitment to continuous development, the company has established itself as a trusted partner for renowned global brands, managing a diverse portfolio of more than 2,000 SKUs. Our core product portfolio spans four main categories:",
    categories: ["Beverages", "Cooking Ingredients", "Personal & Household Care", "Snacks & Confectionery"],
    closing: [
      "We meticulously select high-potential, internationally recognized brands to meet the evolving needs of Thai consumers. Our robust distribution network reaches over 2,000 retail points nationwide, encompassing Modern Trade, Traditional Trade, Food Service, and E-commerce channels.",
      "Guided by uncompromised business ethics, integrity, and customer-first dedication, Piriyapul International Co., Ltd. remains committed to delivering exceptional quality and ensuring maximum satisfaction for all our consumers.",
    ],
    building: { src: "/assets/about-building.png", alt: "Illustration of the Piriyapul International headquarters" },
  },
  shop: {
    buttonHref: "/#products",
    groups: [
      {
        id: "piriyapul",
        name: "Piriyapul",
        logo: { src: "/assets/company-seal.png", alt: "Piriyapul" },
        links: [
          { id: "prp-shopee", label: "Piriyapul Official on Shopee", href: "https://shopee.co.th/piriyapul_official", image: { src: "/assets/shops/shopee.png", alt: "Shopee" } },
          { id: "prp-lazada", label: "Piriyapul International on Lazada", href: "https://www.lazada.co.th/shop/piriyapul-international/", image: { src: "/assets/shops/lazada.png", alt: "Lazada" } },
          { id: "prp-tiktok", label: "Piriyapul Official on TikTok Shop", href: "https://vt.tiktok.com/ZSq41Ster/?page=TikTokShop", image: { src: "/assets/shops/tiktok.png", alt: "TikTok Shop" } },
        ],
      },
      {
        id: "coffee",
        name: "World of Coffee by Nescafé",
        logo: { src: "/assets/shops/world-of-coffee.png", alt: "World of Coffee by Nescafé" },
        links: [
          { id: "coffee-shopee", label: "World of Coffee on Shopee", href: "https://shopee.co.th/world_of_coffee_by_nescafe", image: { src: "/assets/shops/shopee.png", alt: "Shopee" } },
          { id: "coffee-lazada", label: "World of Coffee on Lazada", href: "https://www.lazada.co.th/shop/world-of-coffee-by-nescafe", image: { src: "/assets/shops/lazada.png", alt: "Lazada" } },
        ],
      },
    ],
  },
  values: [
    { title: "AUTHENTIC IMPORTS", caption: "Bringing the world's best to you", icon: "globe" },
    { title: "TRUSTED BRANDS", caption: "Quality you can count on", icon: "shield" },
    { title: "DELIVERED WITH CARE", caption: "From around the world to your home", icon: "truck" },
  ],
  footer: {
    copyright: "© 2026 Piriyapul International. All rights reserved.",
    socials: [
      { label: "Facebook", href: "#", image: { src: "/assets/social/facebook.png", alt: "Facebook" } },
      { label: "TikTok", href: "#", image: { src: "/assets/social/tiktok.png", alt: "TikTok" } },
      { label: "YouTube", href: "#", image: { src: "/assets/social/youtube.png", alt: "YouTube" } },
      { label: "Instagram", href: "#", image: { src: "/assets/social/instagram.png", alt: "Instagram" } },
    ],
  },
};

export function parseSiteContent(value: unknown): SiteContent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Partial<SiteContent>;
  if (!Array.isArray(candidate.navLinks) || !candidate.hero || !Array.isArray(candidate.hero.slides)) return null;
  if (!candidate.homeIntro || !candidate.about || !candidate.shop || !Array.isArray(candidate.shop.groups)) return null;
  if (!Array.isArray(candidate.values) || !candidate.footer || !Array.isArray(candidate.footer.socials)) return null;

  const aboutRecord = candidate.about as unknown as Record<string, unknown>;
  const legacyHero = aboutRecord.hero;
  if (!legacyHero || typeof legacyHero !== "object" || Array.isArray(legacyHero)) return null;
  const heroRecord = legacyHero as Record<string, unknown>;
  let aboutHero: SiteContent["about"]["hero"];
  if (Array.isArray(heroRecord.slides)) {
    aboutHero = { slides: heroRecord.slides as SiteImageSlide[] };
  } else if (typeof heroRecord.src === "string") {
    aboutHero = {
      slides: [{
        id: "about-legacy",
        src: heroRecord.src,
        alt: typeof heroRecord.alt === "string" ? heroRecord.alt : "",
      }],
    };
  } else {
    return null;
  }

  const shopGroups = candidate.shop.groups.map((group) =>
    group.id === "coffee" && !group.logo.src
      ? { ...group, logo: { src: "/assets/shops/world-of-coffee.png", alt: group.logo.alt || group.name } }
      : group,
  );

  return {
    ...candidate,
    shop: { ...candidate.shop, groups: shopGroups },
    about: { ...candidate.about, hero: aboutHero },
  } as SiteContent;
}

export async function getPublishedSiteContent(): Promise<SiteContent> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return defaultSiteContent;
  const { data, error } = await supabase.from("site_content").select("content").eq("id", "published").maybeSingle();
  if (error || !data) return defaultSiteContent;
  return parseSiteContent(data.content) ?? defaultSiteContent;
}

export function toDatabaseJson(content: SiteContent): Json {
  return content as unknown as Json;
}


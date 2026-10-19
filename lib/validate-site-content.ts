import type { SiteContent, SiteImage, SiteImageSlide } from "@/lib/site-content";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown, name: string): UnknownRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${name} มีรูปแบบไม่ถูกต้อง`);
  return value as UnknownRecord;
}

function asText(value: unknown, name: string, max: number, allowEmpty = false): string {
  if (typeof value !== "string") throw new Error(`${name} ต้องเป็นข้อความ`);
  if (value.length > max) throw new Error(`${name} ยาวเกิน ${max} ตัวอักษร`);
  if (!allowEmpty && !value.trim()) throw new Error(`กรุณากรอก${name}`);
  return value;
}

function asId(value: unknown, name: string): string {
  const id = asText(value, name, 100);
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error(`${name} มีอักขระที่ไม่รองรับ`);
  return id;
}

function asHref(value: unknown, name: string): string {
  const href = asText(value, name, 2048);
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (href.startsWith("#")) return href;
  try {
    const parsed = new URL(href);
    if (parsed.protocol === "https:") return href;
  } catch {
    // Report a concise validation error below.
  }
  throw new Error(`${name} ต้องเป็นลิงก์เว็บไซต์ HTTPS หรือเส้นทางภายในเว็บ`);
}

function asImage(value: unknown, name: string, allowEmpty = false): SiteImage {
  const record = asRecord(value, name);
  const src = asText(record.src, `${name}: URL รูป`, 2048, allowEmpty);
  if (src && !src.startsWith("/assets/") && !src.startsWith("https://")) {
    throw new Error(`${name} ต้องเป็นรูปในเว็บไซต์หรือ URL HTTPS`);
  }
  return { src, alt: asText(record.alt ?? "", `${name}: คำอธิบายรูป`, 240, true) };
}

function asAboutHero(value: unknown): SiteContent["about"]["hero"] {
  const record = asRecord(value, "ภาพหน้า About Us");
  if (!Array.isArray(record.slides)) {
    return { slides: [{ id: "about-legacy", ...asImage(record, "ภาพหน้า About Us") }] };
  }

  const slides: SiteImageSlide[] = asList(record.slides, "ภาพหน้า About Us", 1, 8, (item, index) => {
    const slide = asRecord(item, `ภาพหน้า About Us ลำดับ ${index + 1}`);
    const image = asImage(slide, `ภาพหน้า About Us ลำดับ ${index + 1}`);
    return { id: asId(slide.id, "รหัสภาพ"), ...image };
  });
  return { slides };
}

function asList<T>(value: unknown, name: string, min: number, max: number, map: (item: unknown, index: number) => T): T[] {
  if (!Array.isArray(value) || value.length < min || value.length > max) {
    throw new Error(`${name} ต้องมีตั้งแต่ ${min} ถึง ${max} รายการ`);
  }
  return value.map(map);
}

export function validateSiteContentJson(raw: string): SiteContent {
  if (raw.length > 256_000) throw new Error("ข้อมูลหน้าเว็บมีขนาดใหญ่เกินไป");
  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    throw new Error("ข้อมูลหน้าเว็บอ่านไม่สำเร็จ กรุณาลองอีกครั้ง");
  }
  const root = asRecord(input, "ข้อมูลหน้าเว็บ");

  const navLinks = asList(root.navLinks, "เมนูเว็บไซต์", 1, 8, (item, index) => {
    const link = asRecord(item, `เมนูลำดับ ${index + 1}`);
    return {
      id: asId(link.id, "รหัสเมนู"),
      label: asText(link.label, "ชื่อเมนู", 80),
      href: asHref(link.href, "ลิงก์เมนู"),
    };
  });

  const heroRaw = asRecord(root.hero, "Hero");
  const hero = {
    slides: asList(heroRaw.slides, "ภาพ Hero", 1, 8, (item, index) => {
      const slide = asRecord(item, `ภาพ Hero ลำดับ ${index + 1}`);
      const image = asImage({ src: slide.src, alt: slide.alt }, `ภาพ Hero ลำดับ ${index + 1}`);
      return { id: asId(slide.id, "รหัสภาพ"), ...image };
    }),
  };

  const introRaw = asRecord(root.homeIntro, "เนื้อหาแนะนำบริษัท");
  const homeIntro = {
    title: asText(introRaw.title, "หัวข้อแนะนำบริษัท", 160),
    paragraphs: asList(introRaw.paragraphs, "ข้อความแนะนำบริษัท", 1, 6, (item) => asText(item, "ข้อความแนะนำบริษัท", 1200)),
    buttonHref: asHref(introRaw.buttonHref, "ลิงก์ปุ่ม Read More"),
    seal: asImage(introRaw.seal, "ตราบริษัท"),
  };

  const aboutRaw = asRecord(root.about, "About Us");
  const about = {
    hero: asAboutHero(aboutRaw.hero),
    title: asText(aboutRaw.title, "หัวข้อ About Us", 160),
    intro: asText(aboutRaw.intro, "ข้อความ About Us", 1200),
    body: asText(aboutRaw.body, "รายละเอียด About Us", 4000),
    categories: asList(aboutRaw.categories, "รายการหมวดธุรกิจ", 1, 12, (item) => asText(item, "รายการหมวดธุรกิจ", 120)),
    closing: asList(aboutRaw.closing, "ข้อความท้าย About Us", 1, 6, (item) => asText(item, "ข้อความท้าย About Us", 2000)),
    building: asImage(aboutRaw.building, "ภาพอาคารบริษัท"),
  };

  const shopRaw = asRecord(root.shop, "ร้านค้าออนไลน์");
  const shop = {
    buttonHref: asHref(shopRaw.buttonHref, "ลิงก์ปุ่ม Discover More"),
    groups: asList(shopRaw.groups, "กลุ่มร้านค้า", 1, 6, (item, groupIndex) => {
      const group = asRecord(item, `กลุ่มร้านค้าลำดับ ${groupIndex + 1}`);
      return {
        id: asId(group.id, "รหัสกลุ่มร้านค้า"),
        name: asText(group.name, "ชื่อแบรนด์ร้านค้า", 100),
        logo: asImage(group.logo, "โลโก้ร้านค้า", true),
        links: asList(group.links, "ปุ่มร้านค้า", 0, 8, (linkItem, linkIndex) => {
          const link = asRecord(linkItem, `ปุ่มร้านค้าลำดับ ${linkIndex + 1}`);
          return {
            id: asId(link.id, "รหัสปุ่มร้านค้า"),
            label: asText(link.label, "ชื่อปุ่มร้านค้า", 120),
            href: asHref(link.href, "ลิงก์ร้านค้า"),
            image: asImage(link.image, "รูปปุ่มร้านค้า"),
          };
        }),
      };
    }),
  };

  const values = asList(root.values, "จุดขายบริษัท", 1, 6, (item, index) => {
    const value = asRecord(item, `จุดขายลำดับ ${index + 1}`);
    const rawIcon = asText(value.icon, "ไอคอน", 20);
    if (rawIcon !== "globe" && rawIcon !== "shield" && rawIcon !== "truck") throw new Error("ไอคอนจุดขายไม่รองรับ");
    const icon: SiteContent["values"][number]["icon"] = rawIcon;
    return {
      title: asText(value.title, "หัวข้อจุดขาย", 120),
      caption: asText(value.caption, "คำอธิบายจุดขาย", 240),
      icon,
    };
  });

  const footerRaw = asRecord(root.footer, "Footer");
  const footer = {
    copyright: asText(footerRaw.copyright, "ข้อความลิขสิทธิ์", 240),
    socials: asList(footerRaw.socials, "ช่องทาง Social", 0, 10, (item, index) => {
      const social = asRecord(item, `Social ลำดับ ${index + 1}`);
      return {
        label: asText(social.label, "ชื่อ Social", 80),
        href: asHref(social.href, "ลิงก์ Social"),
        image: asImage(social.image, "ไอคอน Social"),
      };
    }),
  };

  return {
    navLinks,
    hero,
    homeIntro,
    productsTitle: asText(root.productsTitle, "หัวข้อสินค้า", 120),
    about,
    shop,
    values,
    footer,
  };
}

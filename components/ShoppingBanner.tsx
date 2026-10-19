import type { SiteContent } from "@/lib/site-content";

type ShopGroup = SiteContent["shop"]["groups"][number];

function StoreLink({ shop }: { shop: ShopGroup["links"][number] }) {
  return (
    <a className="shop-pill" href={shop.href} target="_blank" rel="noreferrer">
      <img src={shop.image.src} alt={shop.image.alt || shop.label} />
    </a>
  );
}

function GroupLogo({ group }: { group: ShopGroup }) {
  const logo = group.logo.src
    ? group.logo
    : group.id === "coffee"
      ? { src: "/assets/shops/world-of-coffee.png", alt: group.name }
      : null;

  if (logo) {
    return (
      <img
        className={`shop-brand-seal${group.id === "coffee" ? " shop-coffee-logo" : ""}`}
        src={logo.src}
        alt={logo.alt || group.name}
      />
    );
  }
  return (
    <div className="coffee-wordmark" aria-label={group.name}>
      <span>{group.name}</span>
    </div>
  );
}

export function ShoppingBanner({ content }: { content: SiteContent["shop"] }) {
  return (
    <section className="shopping-section" id="our-shop" aria-label="Shop online">
      <div className="shopping-banner">
        <div className="shop-mobile-heading">
          <div className="shop-mobile-copy">
            <h2>Special Offer</h2>
            <p>Selected imported favourites</p>
          </div>
          <a className="mobile-offer-link" href={content.buttonHref}>
            Discover more <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="shop-links-panel">
          {content.groups.map((group, groupIndex) => (
            <div className={`shop-group${groupIndex > 0 ? " coffee-group" : ""}`} key={group.id}>
              <GroupLogo group={group} />
              <span className="shop-separator" aria-hidden="true">:</span>
              <div className="shop-pill-row">
                {group.links.map((shop) => <StoreLink key={shop.id} shop={shop} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

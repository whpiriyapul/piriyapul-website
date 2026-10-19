"use client";

import { useEffect, useState } from "react";
import type { SiteContent } from "@/lib/site-content";

type HeroSlides = SiteContent["hero"];

export function HeroCarousel({ hero }: { hero: HeroSlides }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (hero.slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % hero.slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [hero.slides.length]);

  return (
    <section className="hero" aria-label="Featured products">
      {hero.slides.map((slide, index) => (
        <img
          key={slide.id}
          src={slide.src}
          alt={slide.alt}
          className={`${index === active ? "hero-image is-active" : "hero-image"} hero-image-${index + 1}`}
          aria-hidden={index !== active}
          fetchPriority={index === 0 ? "high" : "auto"}
        />
      ))}
      {hero.slides.length > 1 && (
        <div className="hero-pagination" aria-label="Choose a banner">
          {hero.slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={index === active ? "hero-dot is-active" : "hero-dot"}
              onClick={() => setActive(index)}
              aria-label={`Show banner ${index + 1}`}
              aria-pressed={index === active}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function AboutHero({ hero }: { hero: SiteContent["about"]["hero"] }) {
  const slides = hero.slides.filter((slide) => slide.src);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
    if (slides.length < 2) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="about-hero" aria-label="About Us images">
      {slides.map((slide, index) => (
        <img
          key={slide.id}
          src={slide.src}
          alt={slide.alt}
          className={`about-hero-image${index === active ? " is-active" : ""}`}
          aria-hidden={index !== active}
        />
      ))}
      {slides.length > 1 && (
        <div className="about-hero-pagination" aria-label="Choose an About Us image">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`about-hero-dot${index === active ? " is-active" : ""}`}
              onClick={() => setActive(index)}
              aria-label={`Show About Us image ${index + 1}`}
              aria-pressed={index === active}
            />
          ))}
        </div>
      )}
    </section>
  );
}

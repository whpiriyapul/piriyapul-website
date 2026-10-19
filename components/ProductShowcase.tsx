"use client";

import Image from "next/image";
import { useState } from "react";
import { CategoryImage } from "@/components/CategoryImage";
import type { CatalogBrand, CatalogCategory } from "@/lib/catalog";

type ProductShowcaseProps = {
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  title?: string;
};

export function ProductShowcase({ categories, brands, title = "OUR PRODUCTS" }: ProductShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id ?? "");
  const selectedBrands = brands.filter((brand) => brand.category_id === selectedCategory);

  return (
    <section className="products-section" id="products">
      <div className="section-title">
        <span />
        <h2>{title}</h2>
        <span />
      </div>

      <div className="product-content">
        <div className="category-grid" role="group" aria-label="Product categories">
          {categories.map((category) => {
            const isSelected = category.id === selectedCategory;

            return (
              <button
                className="category-chip"
                type="button"
                key={category.id}
                aria-label={category.label}
                aria-pressed={isSelected}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CategoryImage className="category-chip-icon" imageUrl={category.icon_url} />
                <span className="category-chip-label">{category.label}</span>
              </button>
            );
          })}
        </div>

        <div className="brand-grid" aria-label="Featured brands" aria-live="polite">
          {selectedBrands.map((brand) => (
            <div className="brand-card" key={brand.id}>
              <img src={brand.logo_url} alt={brand.name} width={338} height={86} loading="lazy" />
            </div>
          ))}
          {selectedBrands.length === 0 && (
            <p className="empty-category-message">More brands coming soon.</p>
          )}
        </div>
      </div>
    </section>
  );
}

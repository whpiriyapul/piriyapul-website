"use client";

import { useEffect, useState } from "react";
import { addBrand, addCategory, deleteBrand, deleteCategory, updateBrand, updateCategory } from "@/app/admin/actions";
import { CategoryImage } from "@/components/CategoryImage";

type AdminCategory = {
  id: string;
  label: string;
  icon_url: string;
  icon_path: string | null;
};

type AdminBrand = {
  id: string;
  name: string;
  category_id: string;
  logo_url: string;
  logo_path: string | null;
  sort_order: number;
  is_active: boolean;
};

type AdminCatalogManagerProps = {
  categories: AdminCategory[];
  brands: AdminBrand[];
  initialCategoryId: string;
  returnTo?: "admin" | "embedded";
};

function CategoryImageUpload({ name, initialUrl = "" }: { name: string; initialUrl?: string }) {
  const [previewUrl, setPreviewUrl] = useState(initialUrl);

  useEffect(() => () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <div className="admin-category-icon-upload">
      <div className="admin-category-icon-preview">
        {previewUrl ? <img src={previewUrl} alt="ตัวอย่างไอคอนหมวดสินค้า" /> : <span>ตัวอย่างไอคอน</span>}
      </div>
      <label>
        ไอคอน SVG หรือ PNG
        <input
          name={name}
          type="file"
          accept="image/svg+xml,image/png,.svg,.png"
          required
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) setPreviewUrl(URL.createObjectURL(file));
          }}
        />
        <span className="admin-field-hint">ไม่เกิน 2 MB</span>
      </label>
    </div>
  );
}

export function AdminCatalogManager({
  categories,
  brands,
  initialCategoryId,
  returnTo = "admin",
}: AdminCatalogManagerProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);
  const filteredBrands = brands.filter((brand) => brand.category_id === selectedCategoryId);

  return (
    <>
      <section className="admin-panel admin-catalog-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>จัดการหมวดสินค้า</h2>
            <p>เพิ่มได้ไม่เกิน 4 หมวด · แต่ละหมวดใช้รูปไอคอน SVG หรือ PNG</p>
          </div>
          <span className="admin-category-count">{categories.length}/4 หมวด</span>
        </div>
        <form className="admin-form admin-category-create" action={addCategory}>
          <input type="hidden" name="filter_category_id" value={selectedCategoryId} />
          <input type="hidden" name="return_to" value={returnTo} />
          <label>
            ชื่อหมวดสินค้า
            <input name="label" required maxLength={60} placeholder="เช่น Home Care" />
          </label>
          <CategoryImageUpload name="icon" />
          <button className="admin-primary-button" type="submit" disabled={categories.length >= 4}>
            เพิ่มหมวด
          </button>
        </form>
        <div className="admin-category-list">
          {categories.map((category) => {
            const brandCount = brands.filter((brand) => brand.category_id === category.id).length;
            return (
              <article className="admin-category-row" key={category.id}>
                <div className="admin-category-info">
                  <div>
                    <strong>{category.label}</strong>
                    <span>{brandCount} แบรนด์</span>
                  </div>
                </div>
                <div className="admin-category-actions">
                  <form className="admin-category-icon-form" action={updateCategory}>
                    <input type="hidden" name="id" value={category.id} />
                    <input type="hidden" name="filter_category_id" value={selectedCategoryId} />
                    <input type="hidden" name="return_to" value={returnTo} />
                    <CategoryImageUpload name="icon" initialUrl={category.icon_url} />
                    <button className="admin-secondary-button admin-category-save" type="submit">บันทึก</button>
                  </form>
                  <form
                    action={deleteCategory}
                    onSubmit={(event) => {
                      if (!window.confirm(`ลบหมวด ${category.label} ใช่หรือไม่?`)) event.preventDefault();
                    }}
                  >
                    <input type="hidden" name="id" value={category.id} />
                    <input type="hidden" name="filter_category_id" value={selectedCategoryId} />
                    <input type="hidden" name="return_to" value={returnTo} />
                    <button
                      className="admin-danger-button"
                      type="submit"
                      disabled={brandCount > 0}
                      title={brandCount > 0 ? "ย้ายแบรนด์ออกก่อนจึงลบหมวดได้" : undefined}
                    >
                      ลบ
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
          {!categories.length && <p className="admin-empty-state">ยังไม่มีหมวดสินค้า เพิ่มหมวดแรกได้จากช่องด้านบน</p>}
        </div>
      </section>

      <section className="admin-panel admin-catalog-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>เพิ่มแบรนด์</h2>
            <p>อัปโหลดโลโก้ PNG, JPG หรือ WebP ขนาดไม่เกิน 2 MB</p>
          </div>
        </div>
        <form className="admin-form admin-brand-create" action={addBrand}>
          <input type="hidden" name="return_to" value={returnTo} />
          <label>
            ชื่อแบรนด์
            <input name="name" required maxLength={100} placeholder="เช่น Brand Name" />
          </label>
          <label>
            หมวดสินค้า
            <select
              name="category_id"
              required
              value={selectedCategoryId}
              onChange={(event) => setSelectedCategoryId(event.target.value)}
            >
              {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
            </select>
          </label>
          <label>
            ลำดับแสดงผล
            <input name="sort_order" type="number" min="0" defaultValue="1" />
          </label>
          <label className="admin-brand-create-logo">
            โลโก้
            <input name="logo" type="file" accept="image/png,image/jpeg,image/webp" required />
          </label>
          <label className="admin-checkbox-label">
            <input name="is_active" type="checkbox" defaultChecked /> แสดงบนเว็บไซต์
          </label>
          <button className="admin-primary-button" type="submit">เพิ่มแบรนด์</button>
        </form>
      </section>

      <section className="admin-panel admin-catalog-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>แบรนด์ในหมวด {selectedCategory?.label ?? "ที่เลือก"}</h2>
            <p>{filteredBrands.length} รายการ · จากทั้งหมด {brands.length} แบรนด์</p>
          </div>
        </div>

        <div className="admin-brand-list">
          {filteredBrands.map((brand) => (
            <details className="admin-brand-row" key={brand.id}>
              <summary className="admin-brand-summary">
                <span className="admin-brand-preview"><img src={brand.logo_url} alt="" /></span>
                <span className="admin-brand-summary-copy">
                  <strong>{brand.name}</strong>
                  <span>{categories.find((category) => category.id === brand.category_id)?.label ?? "ไม่ระบุหมวด"} · ลำดับ {brand.sort_order} · {brand.is_active ? "แสดง" : "ซ่อน"}</span>
                </span>
                <span className="admin-brand-expand">แก้ไข <span aria-hidden="true">⌄</span></span>
              </summary>
              <div className="admin-brand-detail">
                <form className="admin-form admin-brand-edit" action={updateBrand}>
                  <input type="hidden" name="id" value={brand.id} />
                  <input type="hidden" name="filter_category_id" value={selectedCategoryId} />
                  <input type="hidden" name="return_to" value={returnTo} />
                  <label>
                    ชื่อแบรนด์
                    <input name="name" required maxLength={100} defaultValue={brand.name} />
                  </label>
                  <label>
                    หมวดสินค้า
                    <select name="category_id" required defaultValue={brand.category_id}>
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
                    </select>
                  </label>
                  <label>
                    ลำดับ
                    <input name="sort_order" type="number" min="0" defaultValue={brand.sort_order} />
                  </label>
                  <label className="admin-brand-edit-logo">
                    เปลี่ยนโลโก้
                    <input name="logo" type="file" accept="image/png,image/jpeg,image/webp" />
                  </label>
                  <label className="admin-checkbox-label">
                    <input name="is_active" type="checkbox" defaultChecked={brand.is_active} /> แสดงบนเว็บไซต์
                  </label>
                  <div className="admin-brand-actions">
                    <button className="admin-primary-button" type="submit">บันทึก</button>
                    <button className="admin-danger-button" type="submit" formAction={deleteBrand} formNoValidate>
                      ลบแบรนด์
                    </button>
                  </div>
                </form>
              </div>
            </details>
          ))}
          {!filteredBrands.length && (
            <p className="admin-empty-state">
              {selectedCategory
                ? `ยังไม่มีแบรนด์ในหมวด ${selectedCategory.label} เลือกหมวดอื่นหรือเพิ่มแบรนด์ใหม่ได้เลย`
                : "ยังไม่มีหมวดสินค้าในระบบ"}
            </p>
          )}
        </div>
      </section>
    </>
  );
}

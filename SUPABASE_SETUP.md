# Supabase setup

The Supabase project `piriyapul-website` is connected to this local website. The Project URL and public publishable key are stored in the ignored `.env.local` file. The database setup below has already been run successfully in the project's SQL Editor.

## What's configured

- Four product categories and the existing eight Food & Beverage brands are in the database.
- Row-level security (RLS) is enabled. Visitors can read active catalog entries; only signed-in users listed in `admin_users` can edit categories and brands.
- The public `brand-logos` Storage bucket accepts PNG, JPG, WebP, and SVG files up to 2 MB. Only signed-in catalog users can upload or remove files.
- Product categories use image files for their icons. Four generated SVG icons are included under `public/assets/category-icons`; uploaded replacements are stored in the `categories/` folder in Supabase Storage.
- Existing logos continue to use the checked-in assets in `public/assets/brands`. Newly uploaded logos are stored in Supabase Storage.
- The local website is available at `http://localhost:3000`; the admin sign-in page is `/admin/login`.

The SQL sources are in `supabase/migrations`. The initial catalog setup was applied manually in SQL Editor. The connected `piriyapul-website` project has migration `202610190004_category_icon_images.sql` applied; run it in SQL Editor for other environments to enable category icon uploads and assign the included SVG defaults.

## First administrator

The initial administrator has been added to `admin_users`. Sign in at `/admin/login` using the email and password configured in Supabase Auth. The commented bootstrap query at the bottom of `supabase/migrations/202610190001_catalog_admin.sql` is retained as a reference for another environment.

To send invitations and manage team access from `/admin/team`, add the project Secret key to `.env.local` as `SUPABASE_SECRET_KEY`. Keep it server-only; never add the `NEXT_PUBLIC_` prefix. Restart the Next.js server after changing environment variables.

## Deployment

Set `NEXT_PUBLIC_SITE_URL` to the deployed website URL, add that URL to Authentication → URL Configuration, and add any required auth redirect URL such as `/admin/login`. Configure the project's URL and publishable key in the deployment platform's environment variables. Add the Secret key only if admin invitations are needed. Do not commit `.env.local` or any Secret key.

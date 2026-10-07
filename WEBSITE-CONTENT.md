# Website content and gallery management

## Using the admin panel

Open **Website Content** (`/admin/website`), choose a page, and expand its sections. You can edit the existing headings, paragraphs, image descriptions, contact links, team profiles, program copy and impact figures. Search finds a field by its original label or section. The editor covers Home, About, Programs, Events and Gallery introductions, Get involved, Contact, Footer, and the shared impact band. Event records still belong in Events; registration forms keep their existing fields and behavior.

- **Save draft** stores edits without changing the public website.
- **Publish page** saves any remaining edits and publishes that page. **View live page** opens the current public page.
- **Upload image** converts a new image to WebP and selects it for the draft. **Choose from library** reuses an existing admin upload. **Use image URL** accepts a direct HTTPS image URL. **Remove image** clears the draft image.
- In **About → Team**, use **Add person** to create a profile card. Each card has a name, role, photo, row number, and position within that row. Row and position determine the public page layout; each row/position combination must be unique.
- In **About → Timeline**, use **Add milestone** to create an image-led journey card. Edit its year, optional month, title, description, image, and same-date order. The public timeline is sorted chronologically automatically.
- If another administrator changes the page, saving returns a conflict instead of overwriting their work. Copy any unsaved changes before reloading the editor.

Open **Gallery & Images** (`/admin/gallery`) to upload photos. Add a title, meaningful image description, optional caption, category, display order and visibility. Lower order numbers appear first. New photos default to Draft. Publish, hide, edit or remove photos from their cards. The **All website images** view includes images uploaded from the content editor; select **Include this photo in the website gallery** if one should also appear there.

Removing a photo removes it from the library and public gallery. Its Cloudinary asset is retained because an existing page or draft may still reference it. To replace a page photo, upload/select a new image and publish the page. To replace a gallery photo, upload the new photo and hide or remove the old entry.

Website pages render images selected by an administrator through file upload, the image library, or a direct HTTPS URL. Gallery photos and event covers still use authenticated file uploads. Empty image fields render nothing; stock and placeholder fallbacks are not substituted.

## Server setup and deployment

Install both packages and apply the additive database migration before deploying the updated frontend:

```sh
cd server
npm install
npx prisma generate
npm run prisma:deploy
npm start
```

```sh
cd client
npm install
npm run build
```

Migration `20261007120000_remove_fallback_images` clears legacy fallback URLs, removes external seeded gallery rows, and clears event covers that did not come from the admin uploader. It preserves uploaded Cloudinary files and all non-image records. It has been applied to the database configured in this workspace.

Migration `20261007160000_dynamic_team_members` converts the fixed About-page team fields into reusable member cards while preserving existing names, roles, and image URLs. It has also been applied to the configured database.

Migration `20261007170000_dynamic_journey_timeline` converts the fixed journey copy into chronological milestone cards ready for administrator-uploaded images. It has also been applied to the configured database.

Use the existing server-only `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Cloudinary credentials never enter the frontend bundle. The public frontend origin must be listed in `CORS_ORIGINS`. CORS exposes `ETag` for conditional content reads.

Sharp decodes JPG, PNG and WebP uploads (up to 5 MB and 36 megapixels), rejects animated/invalid images, orients phone photographs, strips metadata, limits dimensions to 2400 × 2400 without enlarging, and encodes WebP at quality 82. Website images are uploaded into `moonlit/website`; event covers are uploaded into `moonlit/events`.

CMS images use a content hash to reuse identical uploads and immutable, versioned Cloudinary URLs. Content changes are plain text, numeric fields or validated links; the editor does not accept executable HTML. Admin endpoints require the existing administrator JWT and return `Cache-Control: no-store`.

## Caching

- **Published content and gallery metadata:** memory plus localStorage, isolated by API origin, fresh for five minutes. Reloads and route changes reuse the same response. Concurrent requests share one fetch. Expired content uses `If-None-Match`/`ETag` and a `304` response when unchanged. A previous copy can serve as an offline fallback for up to 24 hours; failures back off for 30 seconds.
- **Publishing:** clears that origin's public content cache and notifies other tabs through the browser storage event. Older in-flight requests cannot overwrite the new version. Other visitors revalidate on focus or while the visible page is open, normally within about five minutes. API instances keep a 30-second snapshot cache and invalidate it on their own writes.
- **Public image bytes:** `/image-cache-sw.js` caches successful local `/images/` and `/instagram/` images and Cloudinary images in `moonlit/website` or `moonlit/events`. It reuses the exact image URL for up to 30 days, bounded to 100 images and 50 MB, with a 5 MB per-image limit. A new uploaded image gets a new URL. Cache failures fall back to normal image delivery.
- **Private data:** API responses, tokens, admin drafts and volunteer documents are excluded from the image worker. Authenticated API reads keep their existing memory-only cache. The existing `/portal/` push-notification worker retains its own scope and behavior.

Service workers require HTTPS or localhost. Browser storage can be evicted or disabled; ordinary fetching and HTTP caching remain available. A Cloudinary CDN fetch is still necessary for a photo the browser has not cached.

## API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/website` | Public published fields and ordered gallery; conditional ETag response |
| `GET /api/website/admin` | Field registry, drafts, published values and revisions |
| `PUT /api/website/pages/:id` | Save `{ revision, content }` as a draft |
| `POST /api/website/pages/:id/publish` | Publish the saved draft using `{ revision }` |
| `GET /api/website/images` | Administrator image library |
| `POST /api/website/images` | Multipart `image`, `title`, `alt`, `caption`, `category`, `inGallery`; creates a draft |
| `PATCH /api/website/images/:id` | Edit metadata, status, order or gallery inclusion with `revision` |
| `DELETE /api/website/images/:id` | Soft-remove with `{ revision }`; retain the underlying asset |

The editable contract and original values live in `server/src/content/schema.json`. Field keys are stable references used by the React pages. Normal editing is through the admin panel.

## Verification

```sh
cd client
npm run build
npm run lint
```

Verification passed for draft privacy, publishing across tabs, gallery upload/publish/edit/order/hide, responsive editors, persistent content caching, image caching and revalidation. Cache verification also covered concurrent reads, offline fallback, publishing during an in-flight request, private-image exclusions and storage quota failures. Automated writes used mocked database/Cloudinary services; the configured database reads and Cloudinary connectivity were checked separately. The temporary test scripts and screenshots were removed after verification.

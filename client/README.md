# Moonlit Foundation website

React 19 + Vite, with the existing navy (`#0A1F44`), royal blue (`#14338C`), and golden yellow (`#F5B921`) brand palette.

## Run locally

```sh
npm install
npm run dev -- --host 127.0.0.1
```

The public website runs at http://127.0.0.1:5173. See `../server/README.md` for the API setup. Contact, newsletter, volunteer, partner, blood-request, and event forms keep their existing API contracts. API addresses can be configured with the variables in `.env.example`.

## Design and motion

Website Content (`/admin/website`) edits public copy and page images; Gallery & Images (`/admin/gallery`) manages photo uploads and publishing. See [the content management guide](../WEBSITE-CONTENT.md) for the draft/publish workflow, WebP uploads, browser caching, database migration and checks.

- `src/pages/Home.jsx`: editorial homepage, community photography, impact, programs, stories, and volunteer invitations.
- `src/styles/site.css`: responsive public design system. Styles are scoped to the public site; portal and admin styling remains separate.
- `src/components/motion/MotionProvider.jsx`: Lenis synchronized with GSAP's ticker and ScrollTrigger. Touch scrolling stays native. Motion can be paused in the hero or footer, persists locally, and respects the operating system's reduced-motion preference.
- `src/hooks/useScrollFx.js`: scoped GSAP entrances, scroll reveals, counters, parallax, and restrained pointer tilt. Effects and listeners clean up on navigation.
- `src/components/motion/HopeSculpture.jsx`: separately loaded Three.js sculpture, with a static CSS fallback. Rendering pauses offscreen and in hidden tabs; GPU resources are released when it unmounts.
- Public inner pages, admin, and volunteer portal routes load on demand. Deep links wait for lazy page content before positioning and focusing the destination.

The locally saved photos in `public/images/` come from the foundation's existing Cloudinary images, with optimized delivery parameters. No fabricated testimonials or generated community photographs were added. Impact numbers are retained from the existing impact component.

Implementation references: [Lenis and GSAP integration](https://github.com/darkroomengineering/lenis#gsap-scrolltrigger), [Three.js scene setup](https://threejs.org/manual/pages/creating-a-scene.html).

## Verify

```sh
npm run build
npm run lint
```

To preview the production build:

```sh
npm run preview -- --host 127.0.0.1 --port 4173
```

The build may report a size advisory for the separately loaded Three.js renderer. Existing lint warnings remain in the toast provider and service worker.

## Admin and volunteer workspaces

The admin panel and portal share the navy, gold and warm white visual system through `src/components/workspace/` and `src/styles/workspace.css`. Both include responsive navigation with keyboard focus handling, updated sign-in/password screens, real dashboard counts, event photography and reduced-motion support. Existing management pages retain their workflows with shared table, form and modal styling. Printed volunteer IDs and certificates omit the dashboard navigation.

In **Admin → Events**, create or edit an event and choose a JPG, PNG or WebP cover (up to 5 MB), or supply an image URL. The image is shown on the public website, in portal event cards and in email invitations.

To email at creation, choose **Published** and enable **Email volunteers when I create this event**. The event is saved first; the client then sends a separate email request and displays the result, so an email failure does not lose the event. For a later announcement, click the event’s **Share** button. Choose approved volunteers or registered attendees, customize the subject/message, review the invitation and recipient count, then send. Draft events cannot be shared. No emails are sent simply by editing or publishing an existing event.

The workspace fills the viewport; the navigation list and main content scroll independently while the brand/account controls stay visible. Route changes reset the content scroll. Dialogs render outside that scroller, and print styles restore the full document height.

## Instagram reels

The homepage restores all eight original reels, with **real locally downloaded Instagram previews**, carousel buttons, keyboard scrolling, and on-demand Instagram playback. Only the selected embed loads, and the direct Instagram link stays available if Instagram blocks embedded playback or asks a visitor to sign in.

Refresh the saved reel previews:

```sh
npm run sync:instagram
npm run build
```

The refresh script uses public Instagram page metadata and saves images in `public/instagram/`. Reel links and captions live in `src/data/instagram-reels.json`. You can add another public reel URL there, using its shortcode as `id`, then run the refresh command. No Instagram password or API setup is needed for the existing links.

**New-reel discovery:** Instagram did not return the account's reel list in the anonymous profile-page check. Without an API token, the script refreshes the saved links; it cannot promise to discover new posts automatically. It preserves existing previews and links if Instagram is unavailable. With `INSTAGRAM_USER_ID` and `INSTAGRAM_ACCESS_TOKEN` configured privately in `server/.env`, the same command uses Instagram's API to retrieve up to 12 recent reels from the connected account, with pagination and account validation. `INSTAGRAM_API_VERSION` defaults to `v25.0`. Use an Instagram Login token with the `instagram_business_basic` permission for a Business/Creator account; never put the token in a `VITE_*` variable. See [Meta's official Instagram Login documentation](https://www.postman.com/meta/instagram/folder/1z5vxzu/instagram-api-with-instagram-login).

A refresh updates source content, so rebuild and redeploy afterward. The script does not run on visitors' browsers, save passwords, download videos, or bypass Instagram login requirements.


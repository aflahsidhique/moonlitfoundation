import { useState } from "react";
import { cdnUrl, isDecoded, markDecoded } from "../../lib/images";

// Swaps to a fallback image on load error — replaces the legacy site's
// global `img[data-fb]` error-listener delegation (assets/main.js) with a
// plain per-element handler, the React-idiomatic equivalent.
//
// Also does the image-cache bookkeeping: a URL already decoded this session
// paints at full opacity immediately (no fade, no flash on back/forward),
// a new one fades in once it has decoded. `cdnWidth` asks Cloudinary for a
// resized copy where the URL allows it.
export default function Img({ src, fallback, alt = "", className, cdnWidth, loading = "lazy", ...rest }) {
  // cdnWidth (not width) so the plain HTML width attribute still passes
  // through to the element untouched.
  const url = cdnUrl(src, { width: cdnWidth });
  const [ready, setReady] = useState(() => isDecoded(url));

  return (
    <img
      // An image served from the browser cache can fire `load` before React
      // attaches onLoad, which would leave it stuck at opacity 0 — so check
      // `complete` as soon as the node exists.
      ref={(el) => { if (el?.complete && !ready) { markDecoded(url); setReady(true); } }}
      src={url}
      alt={alt}
      className={`mf-img${ready ? " is-ready" : ""}${className ? " " + className : ""}`}
      loading={loading}
      decoding="async"
      onLoad={() => { markDecoded(url); setReady(true); }}
      onError={(e) => {
        if (fallback && e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
        setReady(true);
      }}
      {...rest}
    />
  );
}

import { useState } from "react";
import { cdnUrl, isDecoded, markDecoded } from "../../lib/images";

// Handles image-cache bookkeeping: a URL already decoded this session
// paints at full opacity immediately (no fade, no flash on back/forward),
// a new one fades in once it has decoded. `cdnWidth` asks Cloudinary for a
// resized copy where the URL allows it.
export default function Img({ src, alt = "", className, cdnWidth, loading = "lazy", ...rest }) {
  // cdnWidth (not width) so the plain HTML width attribute still passes
  // through to the element untouched.
  const url = cdnUrl(src, { width: cdnWidth });
  const [loadedUrl, setLoadedUrl] = useState(() => isDecoded(url) ? url : "");
  const [failedUrl, setFailedUrl] = useState("");

  // Only admin-uploaded sources are rendered; empty and broken sources stay empty.
  if (!url || failedUrl === url) return null;
  const ready = loadedUrl === url || isDecoded(url);

  return (
    <img
      // An image served from the browser cache can fire `load` before React
      // attaches onLoad, which would leave it stuck at opacity 0 — so check
      // `complete` as soon as the node exists.
      ref={(el) => { if (el?.complete && el.naturalWidth && !ready) { markDecoded(url); setLoadedUrl(url); } }}
      src={url}
      alt={alt}
      className={`mf-img${ready ? " is-ready" : ""}${className ? " " + className : ""}`}
      loading={loading}
      decoding="async"
      onLoad={() => { markDecoded(url); setLoadedUrl(url); }}
      onError={() => setFailedUrl(url)}
      {...rest}
    />
  );
}

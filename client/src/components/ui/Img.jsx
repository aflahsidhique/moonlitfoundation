import { useState } from "react";
import { cdnUrl, isDecoded, markDecoded } from "../../lib/images";
export default function Img({ src, alt = "", className, cdnWidth, loading = "lazy", ...rest }) {
  const url = cdnUrl(src, { width: cdnWidth });
  const [loadedUrl, setLoadedUrl] = useState(() => isDecoded(url) ? url : "");
  const [failedUrl, setFailedUrl] = useState("");
  if (!url || failedUrl === url) return null;
  const ready = loadedUrl === url || isDecoded(url);
  return <img
    ref={(el) => {
      if (el?.complete && el.naturalWidth && !ready) {
        markDecoded(url);
        setLoadedUrl(url);
      }
    }}
    src={url}
    alt={alt}
    className={`mf-img${ready ? " is-ready" : ""}${className ? " " + className : ""}`}
    loading={loading}
    decoding="async"
    onLoad={() => {
      markDecoded(url);
      setLoadedUrl(url);
    }}
    onError={() => setFailedUrl(url)}
    {...rest}
  />;
}

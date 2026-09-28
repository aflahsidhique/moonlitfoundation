import { useRef } from "react";
import { useScrollFx } from "../../hooks/useScrollFx";

export default function PageFx({ children, className = "" }) {
  const ref = useRef(null);
  useScrollFx(ref);
  return <div ref={ref} className={className}>{children}</div>;
}

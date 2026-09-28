import { Link } from "react-router-dom";

export default function Brand({ light = false }) {
  return <Link to="/" className={`brand${light ? " brand--light" : ""}`} aria-label="Moonlit Foundation home"><img src="/logo.png" alt="" width="56" height="56" /><span className="brand-wordmark">moonlit<span>FOUNDATION</span></span></Link>;
}

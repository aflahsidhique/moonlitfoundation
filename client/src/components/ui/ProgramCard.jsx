import { Link } from "react-router-dom";
import Img from "./Img";

// accent: "red" | "green" | "blue" | "yellow" | "purple" — maps to the
// bg-acc-* utility classes defined in index.css.
export default function ProgramCard({ image, fallback, alt, icon, accent, title, description, to }) {
  return (
    <article className="mf-card p-3 mf-fade">
      <div className="relative">
        <Img className="mf-card-img" src={image} fallback={fallback} alt={alt} />
        <span className={`mf-icon-bubble bg-acc-${accent} absolute top-3 left-3`}><i className={`fa-solid fa-${icon}`}></i></span>
      </div>
      <div className="p-3">
        <h3 className="text-lg mb-2">{title}</h3>
        <p className="text-[13px] leading-relaxed mb-4">{description}</p>
        <Link to={to} className={`mf-mini-arrow bg-acc-${accent}`} aria-label={`${title} program`}><i className="fa-solid fa-arrow-right"></i></Link>
      </div>
    </article>
  );
}

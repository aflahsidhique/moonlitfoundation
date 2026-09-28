import { Link } from "react-router-dom";
import Icon from "./Icon";

export default function PageHero({ crumb, eyebrow, heading, description }) {
  return <section className="inner-hero">
    <div className="site-container">
      <nav className="mf-crumb" aria-label="Breadcrumb"><Link to="/">Home</Link><Icon name="arrow-right" size={13} /><span aria-current="page">{crumb}</span></nav>
      <div className="inner-hero-grid"><div><p className="section-label hero-reveal">{eyebrow}</p><h1 className="hero-reveal">{heading}</h1>{description && <p className="inner-hero-description hero-reveal">{description}</p>}</div><div className="inner-hero-art" aria-hidden="true"><div className="inner-orbit" /><div className="inner-orbit" /><svg data-spin viewBox="0 0 100 100"><path d="M50 0v100M0 50h100M15 15l70 70m0-70L15 85" stroke="currentColor" strokeWidth="15" /></svg><span>SMALL ACTS.<br />LASTING IMPACT.</span></div></div>
    </div>
  </section>;
}

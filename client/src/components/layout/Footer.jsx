import { useWebsite } from "../../hooks/useWebsite";
import { Link } from "react-router-dom";
import Brand from "../ui/Brand";
import Icon from "../ui/Icon";
import MfForm from "../ui/MfForm";
import { useMotion } from "../../hooks/useMotion";

export default function Footer() {
  const { field: cms } = useWebsite();


  const { enabled, reduced, toggle } = useMotion();
  return <footer className="site-footer">
    <div className="site-container">
      <div className="footer-topline"><span className="section-label">{cms("footer.page-content.good-people-greater-possibilities")}</span><a href={cms("footer.page-content.link-https-www-instagram-com-moonlit-foundati")} target="_blank" rel="noopener noreferrer">{cms("footer.page-content.follow-the-journey")}{" "}<Icon name="instagram" size={19} /></a></div>
      <div className="footer-grid">
        <div className="footer-about"><Brand light /><p>{cms("footer.page-content.a-little-compassion-goes-a-long-way")}<br />{cms("footer.page-content.let-s-see-how-far-we-can-go-together")}</p><Link className="footer-location" to="/about"><Icon name="pin" size={15} />{" "}{cms("footer.page-content.rooted-in-kerala-open-to-the-world")}</Link></div>
        <div className="footer-links"><h3>{cms("footer.page-content.explore")}</h3><Link to="/about">{cms("footer.page-content.our-story")}</Link><Link to="/programs">{cms("footer.page-content.our-work")}</Link><Link to="/events">{cms("footer.page-content.events-experiences")}</Link><Link to="/gallery">{cms("footer.page-content.our-gallery")}</Link><Link to="/contact">{cms("footer.page-content.get-in-touch")}</Link></div>
        <div className="footer-links"><h3>{cms("footer.page-content.be-part-of-it")}</h3><Link to="/get-involved#volunteer">{cms("footer.page-content.become-a-volunteer")}</Link><Link to="/get-involved#blood">{cms("footer.page-content.request-blood")}</Link><Link to="/get-involved#partner">{cms("footer.page-content.partner-with-us")}</Link><Link to="/contact">{cms("footer.page-content.support-our-work")}</Link><Link to="/portal/login">{cms("footer.page-content.volunteer-portal")}{" "}<Icon size={13} /></Link></div>
        <div className="footer-newsletter"><h3>{cms("footer.page-content.a-little-good-in-your-inbox")}</h3><p>{cms("footer.page-content.stories-new-experiences-and-ways-to-help")}</p><MfForm endpoint="/newsletter" successMessage="You're on the list. Welcome to the Moonlit community!" className="newsletter-form"><label className="sr-only" htmlFor="newsletter-email">Your email address</label><input id="newsletter-email" name="email" type="email" required placeholder="Your email address" autoComplete="email" /><button type="submit" aria-label="Subscribe to newsletter"><Icon name="arrow-right" size={22} /></button></MfForm><a href={cms("footer.page-content.link-mailto-moonlitfoundation-gmail-com")}>{cms("footer.page-content.moonlitfoundation-gmail-com")}</a><a href={cms("footer.page-content.link-tel-919048414851")}>{cms("footer.page-content.91-9048-414-851")}</a></div>
      </div>
      <div className="footer-wordmark" aria-hidden="true">moonlit<span>®</span><svg viewBox="0 0 100 100" fill="none"><path d="M50 0v100M0 50h100M15 15l70 70m0-70L15 85" stroke="currentColor" strokeWidth="15" /></svg></div>
      <div className="footer-bottom"><p>© {new Date().getFullYear()}{" "}{cms("footer.page-content.moonlit-foundation-made-for-a-better-tomorrow")}</p><button className="motion-toggle" onClick={toggle} disabled={reduced} aria-pressed={enabled} aria-label={reduced ? "Motion disabled by your system preference" : enabled ? "Pause animations" : "Enable animations"}><Icon name={enabled ? "pause" : "play"} size={13} />{reduced ? "Reduced motion" : `Motion ${enabled ? "on" : "off"}`}</button><span>{cms("footer.page-content.small-acts-lasting-impact")}</span></div>
    </div>
  </footer>;
}

import { Link } from "react-router-dom";

const VARIANTS = {
  primary: "mf-btn-primary",
  outline: "mf-btn-outline",
  red: "mf-btn-red",
  redSolid: "mf-btn-red-solid",
  donate: "mf-btn-donate",
  white: "mf-btn-white",
};

// Polymorphic pill button matching the legacy .mf-btn design system —
// renders a router <Link> (internal `to`), a plain <a> (external `href`),
// or a <button>, whichever prop is supplied.
export default function Button({ variant = "primary", to, href, icon, iconPosition = "right", className = "", children, ...rest }) {
  // variant={null} opts out of the fixed palette entirely — e.g. Programs
  // page CTAs use one-off bg-acc-* accent colors instead.
  const cls = ["mf-btn", variant && (VARIANTS[variant] || VARIANTS.primary), className].filter(Boolean).join(" ");
  const iconEl = icon && <i className={`fa-solid fa-${icon}`}></i>;
  const content = (
    <>
      {iconPosition === "left" && iconEl}
      {children}
      {iconPosition === "right" && iconEl}
    </>
  );

  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{content}</a>;
  return <button className={cls} {...rest}>{content}</button>;
}

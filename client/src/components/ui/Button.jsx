import { Link } from "react-router-dom";
const VARIANTS = {
  primary: "mf-btn-primary",
  outline: "mf-btn-outline",
  red: "mf-btn-red",
  redSolid: "mf-btn-red-solid",
  donate: "mf-btn-donate",
  white: "mf-btn-white"
};
export default function Button({ variant = "primary", to, href, icon, iconPosition = "right", className = "", children, ...rest }) {
  const cls = ["mf-btn", variant && (VARIANTS[variant] || VARIANTS.primary), className].filter(Boolean).join(" ");
  const iconEl = icon && <i className={`fa-solid fa-${icon}`} />;
  const content = <>
      {iconPosition === "left" && iconEl}
      {children}
      {iconPosition === "right" && iconEl}
    </>;
  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{content}</a>;
  return <button className={cls} {...rest}>{content}</button>;
}

export default function Icon({ name = "arrow-up-right", size = 20, className = "", ...props }) {
  const paths = {
    "arrow-up-right": <path d="M5 19 19 5M5 5h14v14" />,
    "arrow-right": <path d="M4 12h16m-7-7 7 7-7 7" />,
    "arrow-down": <path d="M12 4v16m-7-7 7 7 7-7" />,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    droplet: <path d="M12 3s-7 7.5-7 12a7 7 0 0 0 14 0c0-4.5-7-12-7-12Zm-3 12a3 3 0 0 0 3 3" />,
    leaf: <><path d="M20 3C7 2 2 7 5 15s17 6 15-12Z" /><path d="m3 22 13-13M8 17v-6m0 6h6" /></>,
    people: <><circle cx="9" cy="7" r="3" /><path d="M3 21v-4a6 6 0 0 1 12 0v4M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v2" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
    menu: <path d="M4 8h16M4 16h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    play: <path d="m9 5 11 7-11 7Z" />,
    pause: <path d="M9 5v14M15 5v14" />,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}>{paths[name] || paths["arrow-up-right"]}</svg>;
}

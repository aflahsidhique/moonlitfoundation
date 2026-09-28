import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { useMotion } from "../../hooks/useMotion";

const EMPTY_REELS = [];

function embedUrl(value) {
  try {
    const url = new URL(value);
    if (!['instagram.com', 'www.instagram.com'].includes(url.hostname)) return null;
    const match = url.pathname.match(/^\/(?:reel|reels|p)\/([\w-]+)\/?$/);
    return match ? `https://www.instagram.com/reel/${match[1]}/embed/` : null;
  } catch { return null; }
}

export default function ReelsCarousel({ items = EMPTY_REELS, account = "moonlit_foundation" }) {
  const trackRef = useRef(null);
  const closeRef = useRef(null);
  const returnFocusRef = useRef(null);
  const { enabled } = useMotion();
  const [active, setActive] = useState(null);
  const [edges, setEdges] = useState({ first: true, last: false });
  const reels = items.map(item => typeof item === 'string' ? { url: item } : item).filter(item => embedUrl(item.url));

  useEffect(() => {
    if (active) closeRef.current?.focus({ preventScroll: true });
    else if (returnFocusRef.current !== null) {
      trackRef.current?.querySelectorAll('.reel-preview')[returnFocusRef.current]?.focus({ preventScroll: true });
      returnFocusRef.current = null;
    }
  }, [active]);

  useEffect(() => {
    const track = trackRef.current;
    const update = () => setEdges({ first: track.scrollLeft <= 2, last: track.scrollLeft + track.clientWidth >= track.scrollWidth - 2 });
    track.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    update();
    return () => { track.removeEventListener('scroll', update); observer.disconnect(); };
  }, [items]);

  function step(direction) {
    const track = trackRef.current;
    const card = track?.querySelector('.instagram-reel');
    if (card) track.scrollBy({ left: direction * (card.offsetWidth + 22), behavior: enabled ? 'smooth' : 'instant' });
  }

  return <div className="instagram-carousel" role="region" aria-label="Instagram reels" aria-roledescription="carousel">
    <div className="reels-toolbar"><span><Icon name="instagram" size={16} /> A little glimpse of life at Moonlit.</span><div className="reels-controls"><button type="button" aria-label="Previous reel" disabled={edges.first} onClick={() => step(-1)}><Icon name="arrow-right" className="reel-arrow-back" size={18} /></button><button type="button" aria-label="Next reel" disabled={edges.last} onClick={() => step(1)}><Icon name="arrow-right" size={18} /></button></div></div>
    <div className="reels-track" ref={trackRef} tabIndex={0} aria-label="Scroll through Instagram reels" onKeyDown={event => { if (event.target !== event.currentTarget) return; if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); } }}>
      {reels.map((reel, index) => <article key={reel.url} className="instagram-reel" aria-label={`Reel ${index + 1} of ${reels.length}`}>
        <div className="reel-player">
          {active === reel.url ? <><iframe src={embedUrl(reel.url)} title={`Instagram reel: ${reel.caption || account}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /><button ref={closeRef} className="reel-close" aria-label="Close reel player" onClick={() => { returnFocusRef.current = index; setActive(null); }}><Icon name="close" size={17} /></button></> : <button className="reel-preview" aria-label={`Play reel: ${reel.caption || `Reel ${index + 1}`}`} onClick={() => setActive(reel.url)}>
            {reel.thumbnail && <img src={reel.thumbnail} alt="" width="400" height="640" loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; }} />}
            <span className="reel-topline"><Icon name="instagram" size={17} /><span>MOONLIT MOMENTS</span><span>{String(index + 1).padStart(2, '0')}</span></span>
            <span className="reel-play-icon"><Icon name="play" size={25} /></span>
            <span className="reel-preview-caption">{reel.caption || 'A moment from our community'}<span>PLAY REEL <Icon name="arrow-up-right" size={15} /></span></span>
          </button>}
        </div>
        <a className="reel-external" href={reel.url} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${reel.caption || `reel ${index + 1}`} on Instagram`}><span>Watch on Instagram</span><Icon name="arrow-up-right" size={15} /></a>
      </article>)}
    </div>
    <p className="reels-note">If Instagram asks you to sign in, use “Watch on Instagram” to open the reel directly.</p>
  </div>;
}

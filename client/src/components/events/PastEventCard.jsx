import Img from "../ui/Img";

export default function PastEventCard({ event, onFeedback }) {
  const monthYear = new Date(event.eventDate).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const desc = event.description.length > 110 ? event.description.slice(0, 108) + "…" : event.description;

  return (
    <article className="mf-card p-3 mf-fade">
      <div className="relative">
        <Img className="mf-card-img" src={event.imageUrl || "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80"} alt={event.title} />
        <span className="mf-chip bg-acc-green absolute top-3 right-3">Completed</span>
      </div>
      <div className="p-3">
        <p className="text-xs text-[#14338C] font-semibold mb-1">{monthYear}</p>
        <h4 className="mb-1">{event.title}</h4>
        <p className="text-[13px] mb-3">{desc}</p>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {event.photoAlbumUrl ? (
            <a href={event.photoAlbumUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] font-semibold" style={{ color: "var(--mf-blue)" }}>
              <i className="fa-solid fa-images mr-1"></i>View Photos
            </a>
          ) : <span />}
          <button type="button" className="text-[12px] font-semibold" style={{ color: "var(--mf-blue)" }} onClick={() => onFeedback(event)}>
            <i className="fa-solid fa-star mr-1"></i>Give Feedback
          </button>
        </div>
      </div>
    </article>
  );
}

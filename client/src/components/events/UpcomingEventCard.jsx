import Img from "../ui/Img";

const CATEGORY_STYLE = {
  "Blood Donation": "bg-acc-red",
  "Community Welfare": "bg-acc-green",
  "Disaster Relief": "bg-acc-blue",
  Environment: "bg-acc-yellow !text-[#0A1F44]",
  "Youth Development": "bg-acc-purple",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function UpcomingEventCard({ event, onRegister }) {
  const d = new Date(event.eventDate);
  const chipClass = CATEGORY_STYLE[event.category] || "bg-acc-blue";
  const spotsLeft = event.capacity ? Math.max(event.capacity - (event._count?.registrations || 0), 0) : null;

  return (
    <article className="mf-card grid md:grid-cols-[38%_1fr] mf-fade">
      <div className="relative">
        <Img className="w-full h-56 md:h-full object-cover" src={event.imageUrl || "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80"} alt={event.title} />
        <span className="mf-date-badge"><span className="d">{String(d.getDate()).padStart(2, "0")}</span><span className="m">{MONTHS[d.getMonth()]}</span></span>
      </div>
      <div className="p-7">
        <span className={`mf-chip ${chipClass} mb-3 inline-block`}>{event.category}</span>
        <h3 className="text-xl mb-2">{event.title}</h3>
        <p className="text-[13px] flex flex-wrap gap-x-5 gap-y-1 mb-3">
          <span><i className="fa-solid fa-location-dot text-[#F5B921] mr-1.5"></i>{event.location}</span>
          <span><i className="fa-solid fa-clock text-[#F5B921] mr-1.5"></i>{event.startTime} – {event.endTime}</span>
        </p>
        <p className="text-[14px] leading-relaxed mb-2">{event.description}</p>
        {spotsLeft !== null && (
          <p className={"text-[12px] mt-2 mb-3 " + (spotsLeft === 0 ? "text-[#DC2626] font-semibold" : "text-[#4B5563]")}>
            {spotsLeft === 0 ? "Fully booked" : `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`}
          </p>
        )}
        <div className="flex items-center gap-4 flex-wrap mt-3">
          <button type="button" className="mf-btn mf-btn-primary" disabled={spotsLeft === 0} onClick={() => onRegister(event)}>
            {spotsLeft === 0 ? "Fully Booked" : "Register Now"} <i className="fa-solid fa-arrow-right"></i>
          </button>
          {event.photoAlbumUrl && (
            <a href={event.photoAlbumUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold" style={{ color: "var(--mf-blue)" }}>
              <i className="fa-solid fa-images mr-1"></i>View Photos
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

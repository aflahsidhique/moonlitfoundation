import { useWebsite } from "../hooks/useWebsite";
import { useMemo, useState } from "react";
import PageFx from "../components/ui/PageFx";
import PageHero from "../components/ui/PageHero";
import Button from "../components/ui/Button";
import { useFetch } from "../hooks/useFetch";
import UpcomingEventCard from "../components/events/UpcomingEventCard";
import PastEventCard from "../components/events/PastEventCard";
import EventRegisterModal from "../components/events/EventRegisterModal";
import EventFeedbackModal from "../components/events/EventFeedbackModal";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

export default function Events() {
  const { field: cms } = useWebsite();

  const { data, loading, error } = useFetch("/events");
  const [filter, setFilter] = useState("all");
  const [registerEvent, setRegisterEvent] = useState(null);
  const [feedbackEvent, setFeedbackEvent] = useState(null);

  const { upcoming, past } = useMemo(() => {
    const events = data?.events || [];
    const now = new Date();
    return {
      upcoming: events.filter((e) => new Date(e.eventDate) >= now).sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)),
      past: events.filter((e) => new Date(e.eventDate) < now).sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate)),
    };
  }, [data]);
 

  const showUpcoming = filter !== "past";
  const showPast = filter !== "upcoming";

  return (
    <PageFx>
      <PageHero
        crumb="Events"
        eyebrow={cms("events.page-introduction.eyebrow-our-events")}
        heading={<>{cms("events.page-introduction.moments-that")}{" "}<span className="mf-hl mf-stroke">{cms("events.page-introduction.matter")}</span></>}
        description={cms("events.page-introduction.description-from-blood-camps-to-beach-cleanup")}
      />

      {/* FILTER TABS */}
      <section className="max-w-7xl mx-auto px-5 pt-14">
        <div className="flex flex-wrap gap-3 mf-fade">
          {FILTERS.map((f) => (
            <button key={f.key} className={"mf-pill" + (filter === f.key ? " is-active" : "")} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      </section>

      {loading && <p className="max-w-7xl mx-auto px-5 py-12 text-[14px] text-[#4B5563]">{cms("events.page-content.loading-events")}</p>}
      {error && <p className="max-w-7xl mx-auto px-5 py-12 text-[14px] text-[#DC2626]">{cms("events.page-content.couldn-t-load-events-right-now-please-try-aga")}</p>}

      {!loading && !error && (
        <>
          {showUpcoming && (
            <section className="max-w-7xl mx-auto px-5 py-12">
              <h2 className="text-2xl md:text-3xl mb-8 mf-fade">{cms("events.max-w-7xl.upcoming")}{" "}<span className="mf-hl mf-stroke">{cms("events.max-w-7xl.events")}</span></h2>
              {upcoming.length ? (
                <div className="space-y-8">
                  {upcoming.map((ev) => <div key={ev.id} id={`event-${ev.id}`} className="scroll-mt-28"><UpcomingEventCard event={ev} onRegister={setRegisterEvent} /></div>)}
                </div>
              ) : (
                <p className="text-[14px] text-[#4B5563]">{cms("events.max-w-7xl.no-upcoming-events-right-now-check-back-soon-")}</p>
              )}
            </section>
          )}

          {showPast && (
            <section className="max-w-7xl mx-auto px-5 pb-16">
              <h2 className="text-2xl md:text-3xl mb-8 mf-fade">{cms("events.max-w-7xl.past")}{" "}<span className="mf-hl mf-stroke">{cms("events.max-w-7xl.events-2")}</span></h2>
              {past.length ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {past.map((ev) => <div key={ev.id} id={`event-${ev.id}`} className="scroll-mt-28"><PastEventCard event={ev} onFeedback={setFeedbackEvent} /></div>)}
                </div>
              ) : (
                <p className="text-[14px] text-[#4B5563]">{cms("events.max-w-7xl.no-past-events-on-record-yet")}</p>
              )}
            </section>
          )}
        </>
      )}

      <EventRegisterModal eventId={registerEvent?.id} eventTitle={registerEvent?.title} onClose={() => setRegisterEvent(null)} />
      <EventFeedbackModal eventId={feedbackEvent?.id} eventTitle={feedbackEvent?.title} onClose={() => setFeedbackEvent(null)} />

      {/* PARTNER CTA */}
      <section className="max-w-7xl mx-auto px-5 pb-20 mf-fade">
        <div className="mf-band px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <h2 className="text-2xl md:text-3xl">{cms("events.max-w-7xl.want-to-organize-an-event")}{" "}<span className="mf-hl mf-stroke">{cms("events.max-w-7xl.with-us")}</span></h2>
          <Button to="/get-involved#partner" variant="donate" icon="arrow-right">{cms("events.max-w-7xl.partner-with-us")}</Button>
        </div>
      </section>
    </PageFx>
  );
}

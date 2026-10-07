import { useWebsite } from "../hooks/useWebsite";
import PageFx from "../components/ui/PageFx";
import PageHero from "../components/ui/PageHero";
import Button from "../components/ui/Button";
import Img from "../components/ui/Img";

export default function About() {
  const { field: cms } = useWebsite();
  const VALUES = [
    { icon: "heart", accent: "red", title: cms("about.values.title-compassion"), text: cms("about.values.text-we-lead-with-empathy-every-person-we-ser") },
    { icon: "scale-balanced", accent: "blue", title: cms("about.values.title-integrity"), text: cms("about.values.text-every-rupee-every-relief-kit-and-every-p") },
    { icon: "bolt", accent: "yellow", title: cms("about.values.title-action"), text: cms("about.values.text-we-move-fast-when-it-matters-hours-count") },
    { icon: "people-group", accent: "green", title: cms("about.values.title-community"), text: cms("about.values.text-change-is-built-together-with-local-peop") },
  ];
  const TIMELINE = [
    { year: cms("about.timeline.year-2021"), title: cms("about.timeline.title-national-integration-camp-bihar"), text: cms("about.timeline.text-youth-programs-in-india-that-bring-stude") },
    { year: cms("about.timeline.year-2022"), title: cms("about.timeline.title-international-cultural-fest-nifaa-hariy"), text: cms("about.timeline.text-nifaa-organizes-haryana-s-renowned-inter") },
    { year: cms("about.timeline.year-2023"), title: cms("about.timeline.title-cultural-exchange-program-tripura"), text: cms("about.timeline.text-a-cultural-exchange-program-in-tripura-p") },
    { year: cms("about.timeline.year-2024"), title: cms("about.timeline.title-adventure-camp-odissa"), text: cms("about.timeline.text-adventure-camp-in-odisha-offers-exciting") },
    { year: cms("about.timeline.year-2025"), title: cms("about.timeline.title-workshop-on-flagship-scheme-keralam"), text: cms("about.timeline.text-the-workshop-on-flagship-schemes-in-kera") },
    { year: cms("about.timeline.year-2026"), title: cms("about.timeline.title-project-sulaimani-keralam"), text: cms("about.timeline.text-project-sulaimani-is-a-community-driven-") },
  ];
  const TEAM = [
    { name: cms("about.team.name-arjun-krishnan"), role: cms("about.team.role-founder-president"), img: cms("about.team.img-https-randomuser-me-api-portraits-men-22-") },
    { name: cms("about.team.name-nithya-menon"), role: cms("about.team.role-vice-president"), img: cms("about.team.img-https-randomuser-me-api-portraits-women-2") },
    { name: cms("about.team.name-rahul-suresh"), role: cms("about.team.role-blood-donation-lead"), img: cms("about.team.img-https-randomuser-me-api-portraits-men-45-") },
    { name: cms("about.team.name-fathima-ashraf"), role: cms("about.team.role-welfare-coordinator"), img: cms("about.team.img-https-randomuser-me-api-portraits-women-5") },
    { name: cms("about.team.name-vishnu-prasad"), role: cms("about.team.role-disaster-response-lead"), img: cms("about.team.img-https-randomuser-me-api-portraits-men-61-") },
    { name: cms("about.team.name-anjali-thomas"), role: cms("about.team.role-environment-lead"), img: cms("about.team.img-https-randomuser-me-api-portraits-women-6") },
    { name: cms("about.team.name-sreejith-nair"), role: cms("about.team.role-youth-programs-lead"), img: cms("about.team.img-https-randomuser-me-api-portraits-men-72-") },
    { name: cms("about.team.name-devika-raj"), role: cms("about.team.role-volunteer-coordinator"), img: cms("about.team.img-https-randomuser-me-api-portraits-women-1") },
  ];

  return (
    <PageFx>
      <PageHero
        crumb="About Us"
        eyebrow={cms("about.page-introduction.eyebrow-who-we-are")}
        heading={<>{cms("about.page-introduction.driven-by-compassion")}<br />{cms("about.page-introduction.powered-by")}{" "}<span className="mf-hl mf-stroke">{cms("about.page-introduction.youth")}</span></>}
        description={cms("about.page-introduction.description-we-are-a-collective-of-young-volu")}
      />

      {/* OUR STORY */}
      <section className="max-w-7xl mx-auto px-5 py-16 lg:py-24 grid lg:grid-cols-2 gap-14 items-center">
        <div className="relative mf-fade">
          <div className="mf-blob-frame">
            <div className="mf-blob h-[300px] md:h-[400px]">
              <Img src={cms("about.max-w-7xl.image-images-volunteers-webp")} alt={cms("about.max-w-7xl.image-description-moonlit-volunteers-gathered")} />
            </div>
          </div>
          <div className="mf-dots absolute -bottom-4 -right-2 hidden md:block" aria-hidden="true"></div>
          <div className="mf-badge-circle absolute -top-6 -left-2 !w-[110px] !h-[110px] text-sm">{cms("about.max-w-7xl.since")}<span className="mf-hl text-xl">{cms("about.max-w-7xl.2021")}</span></div>
        </div>
        <div className="mf-fade">
          <p className="mf-eyebrow mb-3">{cms("about.max-w-7xl.our-story")}</p>
          <h2 className="text-3xl md:text-4xl">{cms("about.max-w-7xl.a-spark-that-became-a")}{" "}<span className="mf-hl mf-stroke">{cms("about.max-w-7xl.movement")}</span></h2>
          <div className="mf-divider my-6"></div>
          <p className="text-[15px] leading-relaxed mb-4">{cms("about.max-w-7xl.moonlit-foundation-founded-in-2021-is-a-youth")}</p>
          <p className="text-[15px] leading-relaxed">{" "}{cms("about.max-w-7xl.moonlit-foundation-also-conducts-camps-and-ev")}</p>
          <Button to="/get-involved" variant="primary" icon="arrow-right" className="mt-8">{cms("about.max-w-7xl.join-our-journey")}</Button>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="max-w-7xl mx-auto px-5 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="mf-card p-8 mf-fade">
            <span className="mf-icon-bubble bg-acc-yellow !text-[#0A1F44] mb-5"><i className="fa-solid fa-bullseye"></i></span>
            <h3 className="text-xl mb-3">{cms("about.max-w-7xl.our-mission")}</h3>
            <p className="text-[14.5px] leading-relaxed">{cms("about.max-w-7xl.to-inspire-young-individuals-to-travel-with-a")}{" "}</p>
          </div>
          <div className="mf-card p-8 mf-fade">
            <span className="mf-icon-bubble bg-[#14338C] mb-5"><i className="fa-solid fa-eye"></i></span>
            <h3 className="text-xl mb-3">{cms("about.max-w-7xl.our-vision")}</h3>
            <p className="text-[14.5px] leading-relaxed">{cms("about.max-w-7xl.to-create-a-compassionate-and-inclusive-socie")}</p>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="max-w-7xl mx-auto px-5 pb-16 lg:pb-24">
        <div className="text-center mb-12 mf-fade">
          <p className="mf-eyebrow mb-3">{cms("about.max-w-7xl.what-guides-us")}</p>
          <h2 className="text-3xl md:text-4xl">{cms("about.max-w-7xl.our-core")}{" "}<span className="mf-hl mf-stroke">{cms("about.max-w-7xl.values")}</span></h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((v) => (
            <div key={v.title} className="mf-card p-7 text-center mf-fade">
              <span className={`mf-icon-bubble bg-acc-${v.accent} mx-auto mb-4`}><i className={`fa-solid fa-${v.icon}`}></i></span>
              <h4 className="mb-2">{v.title}</h4>
              <p className="text-[13px] leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* JOURNEY TIMELINE */}
      <section className="max-w-7xl mx-auto px-5 pb-16 lg:pb-24 grid lg:grid-cols-[38%_1fr] gap-12">
        <div className="mf-fade">
          <p className="mf-eyebrow mb-3">{cms("about.max-w-7xl.our-journey")}</p>
          <h2 className="text-3xl md:text-4xl">{cms("about.max-w-7xl.milestones-that-shaped")}{" "}<span className="mf-hl mf-stroke">{cms("about.max-w-7xl.us")}</span></h2>
          <p className="mt-5 text-[15px]">{cms("about.max-w-7xl.from-one-blood-camp-to-twenty-five-communitie")}</p>
        </div>
        <div className="mf-timeline mf-fade">
          {TIMELINE.map((t) => (
            <div key={t.year} className="mf-tl-item">
              <p className="mf-tl-year">{t.year}</p>
              <h4 className="mb-1">{t.title}</h4>
              <p className="text-[14px]">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="max-w-7xl mx-auto px-5 pb-16 lg:pb-24">
        <div className="text-center mb-12 mf-fade">
          <p className="mf-eyebrow mb-3">{cms("about.max-w-7xl.the-people-behind-the-mission")}</p>
          <h2 className="text-3xl md:text-4xl">{cms("about.max-w-7xl.meet-the")}{" "}<span className="mf-hl mf-stroke">{cms("about.max-w-7xl.team")}</span></h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TEAM.map((m) => (
            <div key={m.name} className="mf-card p-6 text-center mf-fade">
              <Img className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-[#F5B921]/40" src={m.img} alt={m.name} />
              <h4 className="text-base">{m.name}</h4>
              <p className="text-xs text-[#14338C] font-semibold mt-1">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MINI CTA BAND */}
      <section className="max-w-7xl mx-auto px-5 pb-20 mf-fade">
        <div className="mf-band px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <h2 className="text-2xl md:text-3xl">{cms("about.max-w-7xl.ready-to-be-part-of-the")}{" "}<span className="mf-hl mf-stroke">{cms("about.max-w-7xl.story")}</span></h2>
          <div className="flex gap-4 flex-wrap">
            <Button to="/get-involved#volunteer" variant="donate" icon="arrow-right">{cms("about.max-w-7xl.become-a-volunteer")}</Button>
            <Button to="/contact" variant="white">{cms("about.max-w-7xl.talk-to-us")}</Button>
          </div>
        </div>
      </section>
    </PageFx>
  );
}

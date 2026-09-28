import { useWebsite } from "../hooks/useWebsite";
import PageFx from "../components/ui/PageFx";
import PageHero from "../components/ui/PageHero";
import ProgramCard from "../components/ui/ProgramCard";
import ProgramDetail from "../components/ui/ProgramDetail";
import ImpactBand from "../components/ui/ImpactBand";

export default function Programs() {
  const { field: cms } = useWebsite();
  const OVERVIEW = [
    { image: cms("programs.overview.image-https-images-unsplash-com-photo-1615461"), fallback: "https://placehold.co/600x400/14338C/fff?text=Blood+Donation", alt: cms("programs.overview.alt-blood-donation-camp-in-progress"), icon: "droplet", accent: "red", title: cms("programs.overview.title-blood-donation"), description: cms("programs.overview.description-a-single-unit-of-blood-can-save-u"), to: "/programs#blood" },
    { image: cms("programs.overview.image-https-images-unsplash-com-photo-1593113"), fallback: "https://placehold.co/600x400/14338C/fff?text=Community+Welfare", alt: cms("programs.overview.alt-volunteers-packing-food-kits"), icon: "people-group", accent: "green", title: cms("programs.overview.title-community-welfare"), description: cms("programs.overview.description-hardship-rarely-announces-itself"), to: "/programs#welfare" },
    { image: cms("programs.overview.image-https-images-unsplash-com-photo-1547683"), fallback: "https://placehold.co/600x400/14338C/fff?text=Disaster+Relief", alt: cms("programs.overview.alt-rescue-boat-during-flood-response"), icon: "shield-halved", accent: "blue", title: cms("programs.overview.title-disaster-relief"), description: cms("programs.overview.description-when-floods-or-emergencies-strike"), to: "/programs#relief" },
    { image: cms("programs.overview.image-https-images-unsplash-com-photo-1618477"), fallback: "https://placehold.co/600x400/14338C/fff?text=Environment", alt: cms("programs.overview.alt-volunteers-cleaning-a-beach"), icon: "leaf", accent: "yellow", title: cms("programs.overview.title-environment"), description: cms("programs.overview.description-we-protect-the-kerala-we-love-one"), to: "/programs#environment" },
    { image: cms("programs.overview.image-https-images-unsplash-com-photo-1529390"), fallback: "https://placehold.co/600x400/14338C/fff?text=Youth+Development", alt: cms("programs.overview.alt-students-in-a-leadership-workshop"), icon: "graduation-cap", accent: "purple", title: cms("programs.overview.title-youth-development"), description: cms("programs.overview.description-every-program-we-run-is-powered-b"), to: "/programs#youth" },
  ];

  return (
    <PageFx>
      <PageHero
        crumb="Programs"
        eyebrow={cms("programs.page-introduction.eyebrow-what-we-do")}
        heading={<>{cms("programs.page-introduction.programs-that-create")}{" "}<span className="mf-hl mf-stroke">{cms("programs.page-introduction.impact")}</span></>}
        description={cms("programs.page-introduction.description-five-focused-programs-one-goal-me")}
      />

      {/* OVERVIEW GRID */}
      <section className="max-w-7xl mx-auto px-5 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {OVERVIEW.map((p) => <ProgramCard key={p.title} {...p} />)}
        </div>
      </section>

      <ProgramDetail
        id="blood" accent="red" eyebrow={cms("programs.blood.eyebrow-blood-donation-program")} titleLead={cms("programs.blood.titlelead-blood")} titleHighlight={cms("programs.blood.titlehighlight-donation")}
        image={cms("programs.blood.image-https-images-unsplash-com-photo-1615461")} fallback="https://placehold.co/900x700/14338C/fff?text=Blood+Donation" alt={cms("programs.blood.image-description-blood-donation-camp-in-prog")}
        description={cms("programs.blood.description-a-single-unit-of-blood-can-save-u")}
        checklist={[cms("programs.blood.donor-registration-drives-in-colleges-and-wor"), cms("programs.blood.24-7-emergency-donor-response-network-across-"), cms("programs.blood.blood-group-awareness-camps-and-donor-health-")]}
        stats={[{ icon: "droplet", value: cms("programs.blood.value-1800"), label: cms("programs.blood.label-donors-registered") }, { icon: "heart-pulse", value: cms("programs.blood.value-950"), label: cms("programs.blood.label-emergency-requests-met") }]}
      />
      <ProgramDetail
        id="welfare" reverse accent="green" eyebrow={cms("programs.welfare.eyebrow-community-welfare-program")} titleLead={cms("programs.welfare.titlelead-community")} titleHighlight={cms("programs.welfare.titlehighlight-welfare")}
        image={cms("programs.welfare.image-https-images-unsplash-com-photo-1593113")} fallback="https://placehold.co/900x700/14338C/fff?text=Community+Welfare" alt={cms("programs.welfare.image-description-volunteers-packing-food-kit")}
        description={cms("programs.welfare.description-hardship-rarely-announces-itself-")}
        checklist={[cms("programs.welfare.monthly-food-and-grocery-kit-distribution"), cms("programs.welfare.cloth-donation-drives-with-dignity-first-dist"), cms("programs.welfare.school-kit-and-fee-support-for-children-in-ne")]}
        stats={[{ icon: "hand-holding-heart", value: cms("programs.welfare.value-3500"), label: cms("programs.welfare.label-families-supported") }, { icon: "box-open", value: cms("programs.welfare.value-120"), label: cms("programs.welfare.label-relief-campaigns") }]}
      />
      <ProgramDetail
        id="relief" accent="blue" eyebrow={cms("programs.relief.eyebrow-disaster-relief-program")} titleLead={cms("programs.relief.titlelead-disaster")} titleHighlight={cms("programs.relief.titlehighlight-relief")}
        image={cms("programs.relief.image-https-images-unsplash-com-photo-1547683")} fallback="https://placehold.co/900x700/14338C/fff?text=Disaster+Relief" alt={cms("programs.relief.image-description-rescue-boat-during-flood-re")}
        description={cms("programs.relief.description-when-floods-or-emergencies-strike")}
        checklist={[cms("programs.relief.rapid-response-relief-kits-food-water-medicin"), cms("programs.relief.temporary-shelter-coordination-with-local-aut"), cms("programs.relief.post-disaster-cleanup-and-home-rebuilding-sup")]}
        stats={[{ icon: "truck-fast", value: cms("programs.relief.value-48hr"), label: cms("programs.relief.label-average-response-time") }, { icon: "house-chimney-crack", value: cms("programs.relief.value-30"), label: cms("programs.relief.label-rebuilds-supported") }]}
      />
      <ProgramDetail
        id="environment" reverse accent="yellow" ctaDark eyebrow={cms("programs.environment.eyebrow-environment-program")} titleLead={cms("programs.environment.titlelead-environment")} titleHighlight={cms("programs.environment.titlehighlight-drives")}
        image={cms("programs.environment.image-https-images-unsplash-com-photo-1618477")} fallback="https://placehold.co/900x700/14338C/fff?text=Environment" alt={cms("programs.environment.image-description-volunteers-cleaning-a-beach")}
        description={cms("programs.environment.description-we-protect-the-kerala-we-love-one")}
        checklist={[cms("programs.environment.tree-plantation-drives-with-schools-and-resid"), cms("programs.environment.coastal-and-river-cleanup-campaigns"), cms("programs.environment.waste-segregation-and-plastic-free-awareness-")]}
        stats={[{ icon: "leaf", value: cms("programs.environment.value-5000"), label: cms("programs.environment.label-trees-planted") }, { icon: "water", value: cms("programs.environment.value-40"), label: cms("programs.environment.label-cleanup-drives") }]}
      />
      <ProgramDetail
        id="youth" accent="purple" eyebrow={cms("programs.youth.eyebrow-youth-development-program")} titleLead={cms("programs.youth.titlelead-youth")} titleHighlight={cms("programs.youth.titlehighlight-development")}
        image={cms("programs.youth.image-https-images-unsplash-com-photo-1529390")} fallback="https://placehold.co/900x700/14338C/fff?text=Youth+Development" alt={cms("programs.youth.image-description-students-in-a-leadership-wo")}
        description={cms("programs.youth.description-every-program-we-run-is-powered-b")}
        checklist={[cms("programs.youth.leadership-and-public-speaking-workshops"), cms("programs.youth.career-and-skill-development-mentorship"), cms("programs.youth.campus-volunteer-chapters-in-colleges-across-")]}
        stats={[{ icon: "users", value: cms("programs.youth.value-2500"), label: cms("programs.youth.label-volunteers-engaged") }, { icon: "chalkboard-user", value: cms("programs.youth.value-85"), label: cms("programs.youth.label-workshops-conducted") }]}
      />

      {/* IMPACT STRIP */}
      <section className="max-w-7xl mx-auto px-5 py-16 mf-fade">
        <ImpactBand spark={false} />
      </section>
    </PageFx>
  );
}

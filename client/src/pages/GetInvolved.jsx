import { useWebsite } from "../hooks/useWebsite";
import { useState } from "react";
import PageFx from "../components/ui/PageFx";
import PageHero from "../components/ui/PageHero";
import Img from "../components/ui/Img";
import ImpactBand from "../components/ui/ImpactBand";
import MfForm from "../components/ui/MfForm";
import { TextField, TextareaField, SelectField, FileField, CheckboxGrid } from "../components/ui/FormField";
import { useLocationCascade } from "../hooks/useLocationCascade";
import { KERALA_DISTRICTS } from "../lib/kerala";

const BLOOD_GROUPS = ["A+", "A−", "B+", "B−", "O+", "O−", "AB+", "AB−"];
const SKILLS = ["Disaster Relief", "Event Management", "Medical Support", "Social Media", "Photography", "Fundraising", "Teaching", "Others"];
const AVAILABLE_TIMES = ["Morning", "Afternoon", "Weekend", "Full Time"];

export default function GetInvolved() {
  const { field: cms } = useWebsite();

  const cascade = useLocationCascade();
  const [isBloodDonor, setIsBloodDonor] = useState(false);

  return (
    <PageFx>
      <PageHero
        crumb="Get Involved"
        eyebrow={cms("get-involved.page-introduction.eyebrow-get-involved")}
        heading={<>{cms("get-involved.page-introduction.be-part-of-the")}{" "}<span className="mf-hl mf-stroke">{cms("get-involved.page-introduction.change")}</span></>}
        description={cms("get-involved.page-introduction.description-three-ways-to-stand-with-us-give-")}
      />

      {/* PATHWAY CARDS */}
      <section className="max-w-7xl mx-auto px-5 py-14">
        <div className="grid md:grid-cols-3 gap-6">
          <a href="#volunteer" className="mf-card p-8 text-center block mf-fade">
            <span className="mf-icon-bubble bg-[#14338C] mx-auto mb-4"><i className="fa-solid fa-users"></i></span>
            <h3 className="text-lg mb-2">{cms("get-involved.max-w-7xl.become-a-volunteer")}</h3>
            <p className="text-[13.5px]">{cms("get-involved.max-w-7xl.join-2-500-young-people-serving-communities-a")}</p>
            <span className="mf-mini-arrow bg-[#14338C] mt-5 inline-flex"><i className="fa-solid fa-arrow-down"></i></span>
          </a>
          <a href="#blood" className="mf-card p-8 text-center block mf-fade">
            <span className="mf-icon-bubble bg-acc-red mx-auto mb-4"><i className="fa-solid fa-droplet"></i></span>
            <h3 className="text-lg mb-2">{cms("get-involved.max-w-7xl.request-blood")}</h3>
            <p className="text-[13.5px]">{cms("get-involved.max-w-7xl.need-blood-support-urgently-our-donor-network")}</p>
            <span className="mf-mini-arrow bg-acc-red mt-5 inline-flex"><i className="fa-solid fa-arrow-down"></i></span>
          </a>
          <a href="#partner" className="mf-card p-8 text-center block mf-fade">
            <span className="mf-icon-bubble bg-acc-yellow !text-[#0A1F44] mx-auto mb-4"><i className="fa-solid fa-handshake"></i></span>
            <h3 className="text-lg mb-2">{cms("get-involved.max-w-7xl.partner-with-us")}</h3>
            <p className="text-[13.5px]">{cms("get-involved.max-w-7xl.csr-programs-campus-chapters-and-ngo-collabor")}</p>
            <span className="mf-mini-arrow bg-acc-yellow mt-5 inline-flex"><i className="fa-solid fa-arrow-down"></i></span>
          </a>
        </div>
      </section>

      {/* VOLUNTEER */}
      <section id="volunteer" className="max-w-7xl mx-auto px-5 py-14 grid lg:grid-cols-2 gap-14 items-start scroll-mt-24">
        <div className="mf-fade">
          <p className="mf-eyebrow mb-3">{cms("get-involved.volunteer.volunteer-with-us")}</p>
          <h2 className="text-3xl md:text-4xl">{cms("get-involved.volunteer.give-your-time")}<br />{cms("get-involved.volunteer.gain-a")}{" "}<span className="mf-hl mf-stroke">{cms("get-involved.volunteer.community")}</span></h2>
          <div className="mf-divider my-6"></div>
          <p className="text-[15px] mb-6">{cms("get-involved.volunteer.whether-you-can-give-one-weekend-a-month-or-o")}</p>
          <ul className="space-y-3 mb-10">
            <li className="mf-check"><i className="fa-solid fa-check bg-[#14338C]"></i><span className="text-[14px]">{cms("get-involved.volunteer.hands-on-roles-across-all-five-programs-match")}</span></li>
            <li className="mf-check"><i className="fa-solid fa-check bg-[#14338C]"></i><span className="text-[14px]">{cms("get-involved.volunteer.free-training-in-first-response-event-managem")}</span></li>
            <li className="mf-check"><i className="fa-solid fa-check bg-[#14338C]"></i><span className="text-[14px]">{cms("get-involved.volunteer.volunteer-certificates-and-letters-of-recomme")}</span></li>
            <li className="mf-check"><i className="fa-solid fa-check bg-[#14338C]"></i><span className="text-[14px]">{cms("get-involved.volunteer.a-statewide-network-of-friends-who-show-up-fo")}</span></li>
          </ul>
          <div className="relative max-w-sm">
            <div className="mf-blob-frame"><div className="mf-blob h-[240px]">
              <Img src={cms("get-involved.volunteer.image-https-images-unsplash-com-photo-1559027")} fallback="https://placehold.co/700x500/14338C/fff?text=Volunteers" alt={cms("get-involved.volunteer.image-description-moonlit-volunteers-together")} />
            </div></div>
            <div className="mf-dots absolute -bottom-4 -right-4 hidden md:block" aria-hidden="true"></div>
          </div>
        </div>

        <MfForm endpoint="/volunteers" onSuccess={() => setIsBloodDonor(false)} successMessage="Welcome aboard! Our volunteer team will contact you within 3 days." className="mf-form-card mf-fade">
          {({ submitting }) => <>
          <h3 className="text-xl mb-6">Volunteer Registration</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <h4 className="mf-form-section sm:col-span-2">Personal Details</h4>
            <TextField label="Full Name" name="fullName" required placeholder="Your name" />
            <TextField label="Date of Birth" name="dob" type="date" required />
            <SelectField label="Gender" name="gender" required error="Please select a gender.">
              <option value="">Select gender</option><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option>
            </SelectField>
            <TextField label="Aadhaar Number" name="aadhaar" hint="(optional)" inputMode="numeric" maxLength={12} placeholder="XXXX XXXX XXXX" />
            <TextField label="Mobile" name="mobile" type="tel" required placeholder="+91 ..." />
            <TextField label="WhatsApp" name="whatsapp" type="tel" hint="(if different)" placeholder="+91 ..." />
            <TextField label="Email" name="email" type="email" required span placeholder="you@example.com" />
            <FileField label="Photo" name="photo" hint="(JPG or PNG, max 5MB)" span />

            <h4 className="mf-form-section sm:col-span-2">Address</h4>
            <TextField label="House / Street" name="address" required span placeholder="House name, street" />
            <TextField label="State" name="state" required defaultValue="Kerala" />
            <SelectField label="District" name="district" required value={cascade.district} onChange={cascade.onDistrictChange} error="Please choose a district.">
              <option value="">Select your district</option>
              {KERALA_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
            </SelectField>
            <SelectField label="Taluk" name="taluk" required disabled={!cascade.district} value={cascade.taluk} onChange={cascade.onTalukChange} error="Please choose your taluk.">
              <option value="">{cascade.district ? "Select your taluk" : "Select district first"}</option>
              {cascade.taluks.map((t) => <option key={t}>{t}</option>)}
            </SelectField>
            <SelectField label="Panchayat / Municipality" name="panchayat" required disabled={!cascade.taluk} error="Please choose your panchayat or municipality.">
              <option value="">{cascade.taluk ? "Select your panchayat/municipality" : "Select taluk first"}</option>
              {cascade.panchayats.map((p) => <option key={p}>{p}</option>)}
            </SelectField>
            <TextField label="Ward" name="ward" required placeholder="Ward number/name" />
            <TextField label="PIN Code" name="pin" required inputMode="numeric" maxLength={6} placeholder="6-digit PIN" />

            <h4 className="mf-form-section sm:col-span-2">Emergency Contact</h4>
            <TextField label="Name" name="emergencyName" required placeholder="Contact's name" error="Please enter an emergency contact." />
            <TextField label="Relationship" name="emergencyRelationship" required placeholder="e.g. Parent, Spouse" />
            <TextField label="Phone" name="emergencyPhone" type="tel" required span placeholder="+91 ..." error="Please enter an emergency contact number." />

            <h4 className="mf-form-section sm:col-span-2">Skills</h4>
            <CheckboxGrid legend="Skills" name="skills" options={SKILLS} cols="grid-cols-1 sm:grid-cols-2" />

            <h4 className="mf-form-section sm:col-span-2">Blood Donation</h4>
            <div className="sm:col-span-2">
              <span className="mf-label">Blood Donor?</span>
              <div className="flex items-center gap-5 h-[46px]">
                <label className="flex items-center gap-2 text-[14px]"><input type="radio" name="isBloodDonor" value="yes" className="accent-[#DC2626]" checked={isBloodDonor} onChange={() => setIsBloodDonor(true)} /> Yes</label>
                <label className="flex items-center gap-2 text-[14px]"><input type="radio" name="isBloodDonor" value="no" className="accent-[#DC2626]" checked={!isBloodDonor} onChange={() => setIsBloodDonor(false)} /> No</label>
              </div>
            </div>
            {isBloodDonor && (
              <>
                <SelectField label="Blood Group" name="bloodGroup">
                  <option value="">Select group</option>
                  {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
                </SelectField>
                <TextField label="Last Blood Donation" name="lastBloodDonationDate" type="date" hint="(if any)" />
                <TextField label="Weight (kg)" name="weight" type="number" min={30} max={200} placeholder="e.g. 60" />
                <TextareaField label="Medical Conditions" name="medicalConditions" hint="(optional)" span rows={2} placeholder="Anything we should know about" />
              </>
            )}

            <h4 className="mf-form-section sm:col-span-2">Available Time</h4>
            <CheckboxGrid legend="Available Time" name="availableTime" options={AVAILABLE_TIMES} cols="grid-cols-2 sm:grid-cols-4" />

            <h4 className="mf-form-section sm:col-span-2">Social Media <span className="text-[#9CA3AF] font-normal normal-case tracking-normal">(optional)</span></h4>
            <TextField label={<><i className="fa-brands fa-instagram mr-1"></i> Instagram</>} name="instagram" placeholder="@handle" />
            <TextField label={<><i className="fa-brands fa-facebook mr-1"></i> Facebook</>} name="facebook" placeholder="Profile link" />
            <TextField label={<><i className="fa-brands fa-linkedin mr-1"></i> LinkedIn</>} name="linkedin" span placeholder="Profile link" />

            <h4 className="mf-form-section sm:col-span-2">ID Verification</h4>
            <SelectField label="ID Type" name="idType">
              <option value="">Select ID type</option><option>Aadhaar</option><option>Driving License</option><option>Passport</option>
            </SelectField>
            <FileField label="Upload ID" name="idUpload" hint="(JPG or PNG, max 5MB)" />

            <TextareaField label="Message" name="message" span rows={3} placeholder="Tell us a little about yourself (optional)" />
          </div>
          <button type="submit" className="mf-btn mf-btn-primary mt-6 w-full justify-center" disabled={submitting} aria-busy={submitting}>
            {submitting ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Submitting...</> : <>Join as a Volunteer <i className="fa-solid fa-arrow-right"></i></>}
          </button>
          </>}
        </MfForm>
      </section>

      {/* REQUEST BLOOD */}
      <section id="blood" className="max-w-7xl mx-auto px-5 py-14 grid lg:grid-cols-2 gap-14 items-start scroll-mt-24">
        <div className="mf-fade lg:order-2">
          <p className="mf-eyebrow mb-3" style={{ color: "var(--mf-red)" }}>{cms("get-involved.blood.blood-support")}</p>
          <h2 className="text-3xl md:text-4xl">{cms("get-involved.blood.need-blood")}<br />{cms("get-involved.blood.we-re")}{" "}<span className="mf-hl mf-stroke">{cms("get-involved.blood.here-to-help")}</span></h2>
          <div className="mf-divider my-6" style={{ background: "var(--mf-red)" }}></div>
          <p className="text-[15px] mb-6">{cms("get-involved.blood.fill-in-the-request-and-our-donor-coordinatio")}</p>
          <div className="mf-card p-5 flex items-center gap-4 border-l-4" style={{ borderColor: "var(--mf-red)" }}>
            <i className="fa-solid fa-phone-volume text-2xl" style={{ color: "var(--mf-red)" }}></i>
            <p className="text-[14px]"><strong className="text-[#111827]">{cms("get-involved.blood.for-emergencies-call-us-directly")}</strong><br /><a className="font-bold text-[#14338C]" href={cms("get-involved.blood.link-tel-919048414851")}>{cms("get-involved.blood.91-9048-414-851")}</a>{" "}{cms("get-involved.blood.available-24-7")}</p>
          </div>
        </div>

        <MfForm endpoint="/blood-requests" successMessage="Request received. Our donor team is on it — expect a call shortly." className="mf-form-card mf-fade lg:order-1">
          {({ submitting }) => <>
          <h3 className="text-xl mb-6">Blood Request Form</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <TextField label="Patient Name" name="patientName" required placeholder="Patient's full name" error="Please enter the patient's name." />
            <SelectField label="Blood Group" name="bloodGroup" required error="Please choose a blood group.">
              <option value="">Select group</option>
              {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
            </SelectField>
            <TextField label="Units Needed" name="units" type="number" min={1} required placeholder="e.g. 2" error="Please enter units needed." />
            <SelectField label="Urgency" name="urgency" required error="Please choose urgency.">
              <option value="">Select urgency</option><option>Emergency — within hours</option><option>Urgent — within 24 hours</option><option>Planned — date scheduled</option>
            </SelectField>
            <TextField label="Hospital" name="hospital" required span placeholder="Hospital name" error="Please enter the hospital." />
            <SelectField label="District" name="district" required error="Please choose a district.">
              <option value="">Select district</option>
              {KERALA_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
            </SelectField>
            <TextField label="Location Detail" name="location" required placeholder="Ward / landmark" error="Please enter a location detail." />
            <TextField label="Doctor" name="doctorName" hint="(optional)" placeholder="Treating doctor's name" />
            <TextField label="Contact Number" name="phone" type="tel" required placeholder="+91 ..." error="Please enter a contact number." />
            <FileField label="Supporting Documents" name="documents" span hint="(prescription, referral — JPG or PNG, up to 3 files, 5MB each)" multiple />
          </div>
          <button type="submit" className="mf-btn mf-btn-red-solid mt-6 w-full justify-center" disabled={submitting} aria-busy={submitting}>
            {submitting ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Submitting...</> : <><i className="fa-solid fa-droplet"></i> Submit Request</>}
          </button>
          </>}
        </MfForm>
      </section>

      {/* PARTNER WITH US */}
      <section id="partner" className="max-w-7xl mx-auto px-5 py-14 grid lg:grid-cols-2 gap-14 items-start scroll-mt-24">
        <div className="mf-fade">
          <p className="mf-eyebrow mb-3">{cms("get-involved.partner.partnerships")}</p>
          <h2 className="text-3xl md:text-4xl">{cms("get-involved.partner.stronger")}{" "}<span className="mf-hl mf-stroke">{cms("get-involved.partner.together")}</span></h2>
          <div className="mf-divider my-6"></div>
          <p className="text-[15px] mb-6">{cms("get-involved.partner.we-work-with-companies-colleges-and-fellow-ng")}</p>
          <ul className="space-y-3">
            <li className="mf-check"><i className="fa-solid fa-check bg-acc-yellow !text-[#0A1F44]"></i><span className="text-[14px]"><strong className="text-[#111827]">{cms("get-involved.partner.csr-partnerships")}</strong>{" "}{cms("get-involved.partner.sponsor-relief-campaigns-plantation-drives-or")}</span></li>
            <li className="mf-check"><i className="fa-solid fa-check bg-acc-yellow !text-[#0A1F44]"></i><span className="text-[14px]"><strong className="text-[#111827]">{cms("get-involved.partner.campus-chapters")}</strong>{" "}{cms("get-involved.partner.start-a-moonlit-volunteer-unit-in-your-colleg")}</span></li>
            <li className="mf-check"><i className="fa-solid fa-check bg-acc-yellow !text-[#0A1F44]"></i><span className="text-[14px]"><strong className="text-[#111827]">{cms("get-involved.partner.ngo-collaborations")}</strong>{" "}{cms("get-involved.partner.joint-drives-shared-donor-networks-faster-res")}</span></li>
          </ul>
        </div>
        <MfForm endpoint="/partners" successMessage="Thank you! Our partnerships team will reach out within a week." className="mf-form-card mf-fade">
          {({ submitting }) => <>
          <h3 className="text-xl mb-6">Partnership Inquiry</h3>
          <div className="grid gap-5">
            <TextField label="Organization" name="organization" required placeholder="Company / college / NGO name" error="Please enter your organization." />
            <TextField label="Contact Person" name="contactPerson" required placeholder="Your name" error="Please enter a contact person." />
            <TextField label="Email" name="email" type="email" required placeholder="you@organization.com" />
            <TextareaField label="Message" name="message" required rows={4} placeholder="Tell us what you have in mind" error="Please add a short message." />
          </div>
          <button type="submit" className="mf-btn mf-btn-primary mt-6 w-full justify-center" disabled={submitting} aria-busy={submitting}>
            {submitting ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Submitting...</> : <>Send Inquiry <i className="fa-solid fa-arrow-right"></i></>}
          </button>
          </>}
        </MfForm>
      </section>

      {/* IMPACT STRIP */}
      <section className="max-w-7xl mx-auto px-5 py-10 pb-20 mf-fade">
        <ImpactBand compact />
      </section>
    </PageFx>
  );
}

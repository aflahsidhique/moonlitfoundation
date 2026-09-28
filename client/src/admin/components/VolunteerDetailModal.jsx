import AdminModal from "./AdminModal";
import StatusBadge from "./StatusBadge";
import { VdSection, VdGrid, VdField, ChipList, FileLink } from "./VdHelpers";
import { resolveFileUrl, fmtDate } from "../lib/format";

export default function VolunteerDetailModal({ volunteer: v, onClose }) {
  return (
    <AdminModal open={!!v} onClose={onClose} title="Volunteer Profile" wide>
      {v && (
        <div>
          <div className="mf-vd-header">
            {v.photoUrl
              ? <img className="mf-vd-photo" src={resolveFileUrl(v.photoUrl)} alt="" />
              : <div className="mf-vd-photo flex items-center justify-center text-[#9CA3AF]"><i className="fa-solid fa-user"></i></div>}
            <div>
              <p className="text-lg font-bold">{v.fullName} {v.volunteerId && <span className="text-sm font-normal text-[#4B5563]">({v.volunteerId})</span>}</p>
              <p className="mt-1"><StatusBadge status={v.status} /></p>
            </div>
          </div>

          <VdSection>Personal Details</VdSection>
          <VdGrid>
            <VdField label="Date of Birth">{fmtDate(v.dob)}</VdField>
            <VdField label="Gender">{v.gender}</VdField>
            <VdField label="Aadhaar">{v.aadhaar}</VdField>
            <VdField label="Mobile">{v.mobile}</VdField>
            <VdField label="WhatsApp">{v.whatsapp}</VdField>
            <VdField label="Email">{v.email}</VdField>
            <VdField label="Photo"><FileLink url={v.photoUrl} label="View photo" /></VdField>
          </VdGrid>

          <VdSection>Address</VdSection>
          <VdGrid>
            <VdField label="House / Street">{v.address}</VdField>
            <VdField label="State">{v.state}</VdField>
            <VdField label="District">{v.district}</VdField>
            <VdField label="Taluk">{v.taluk}</VdField>
            <VdField label="Panchayat">{v.panchayat}</VdField>
            <VdField label="Ward">{v.ward}</VdField>
            <VdField label="PIN">{v.pin}</VdField>
          </VdGrid>

          <VdSection>Emergency Contact</VdSection>
          <VdGrid>
            <VdField label="Name">{v.emergencyName}</VdField>
            <VdField label="Relationship">{v.emergencyRelationship}</VdField>
            <VdField label="Phone">{v.emergencyPhone}</VdField>
          </VdGrid>

          <VdSection>Skills</VdSection>
          <ChipList csv={v.skills} />
          <VdSection>Available Time</VdSection>
          <ChipList csv={v.availableTime} />

          <VdSection>Blood Donation</VdSection>
          <VdGrid>
            <VdField label="Blood Group">{v.bloodGroup}</VdField>
            <VdField label="Donor?">{v.isBloodDonor ? "Yes" : "No"}</VdField>
            <VdField label="Availability">{v.bloodDonationAvailable ? "Available" : "Unavailable"}</VdField>
            <VdField label="Eligible Now?">{v.eligible ? "Yes" : "No"}</VdField>
            <VdField label="Donations Logged">{v.donationCount || 0}</VdField>
            <VdField label="Last Donation">{v.lastDonationDate ? fmtDate(v.lastDonationDate) : null}</VdField>
            <VdField label="Next Eligible">{v.nextEligibleDate ? fmtDate(v.nextEligibleDate) : null}</VdField>
            <VdField label="Weight">{v.weight ? `${v.weight} kg` : null}</VdField>
          </VdGrid>
          {v.bloodDonations?.length > 0 && (
            <>
              <VdSection>Donation History</VdSection>
              {v.bloodDonations.map((d) => (
                <p key={d.id} className="text-[13px]">{fmtDate(d.donationDate)}{d.location ? ` — ${d.location}` : ""}</p>
              ))}
            </>
          )}
          {v.medicalConditions && (<><VdSection>Medical Conditions</VdSection><p className="text-[13px]">{v.medicalConditions}</p></>)}

          <VdSection>Social Media</VdSection>
          <VdGrid>
            <VdField label="Instagram">{v.instagram}</VdField>
            <VdField label="Facebook">{v.facebook}</VdField>
            <VdField label="LinkedIn">{v.linkedin}</VdField>
          </VdGrid>

          <VdSection>ID Verification</VdSection>
          <VdGrid>
            <VdField label="ID Type">{v.idType}</VdField>
            <VdField label="Document"><FileLink url={v.idUploadUrl} label="View document" /></VdField>
          </VdGrid>

          {v.message && (<><VdSection>Message</VdSection><p className="text-[13px]">{v.message}</p></>)}
        </div>
      )}
    </AdminModal>
  );
}

// Standard minimum gap between whole-blood donations. 90 days (~3 months)
// is the common interval used by Indian blood banks; adjust here if your
// medical guidelines differ.
const DONATION_INTERVAL_DAYS = 90;

// donationRecords: array of { donationDate } for this volunteer, any order.
// Falls back to the volunteer's self-reported lastBloodDonationDate (from
// the registration form) only when no admin-logged history exists yet.
function computeEligibility(volunteer, donationRecords) {
  const records = donationRecords || [];
  const donationCount = records.length;

  let lastDonationDate = null;
  if (records.length) {
    lastDonationDate = records.reduce((latest, r) => {
      const d = new Date(r.donationDate);
      return !latest || d > latest ? d : latest;
    }, null);
  } else if (volunteer.lastBloodDonationDate) {
    lastDonationDate = new Date(volunteer.lastBloodDonationDate);
  }

  let nextEligibleDate = null;
  if (lastDonationDate) {
    nextEligibleDate = new Date(lastDonationDate);
    nextEligibleDate.setDate(nextEligibleDate.getDate() + DONATION_INTERVAL_DAYS);
  }

  const pastInterval = !nextEligibleDate || new Date() >= nextEligibleDate;
  const eligible = Boolean(volunteer.isBloodDonor && volunteer.bloodDonationAvailable && pastInterval);

  return { donationCount, lastDonationDate, nextEligibleDate, eligible };
}

module.exports = { computeEligibility, DONATION_INTERVAL_DAYS };

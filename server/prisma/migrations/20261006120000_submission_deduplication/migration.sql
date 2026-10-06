ALTER TABLE "BloodRequest" ADD COLUMN "submissionKey" TEXT;
ALTER TABLE "PartnerInquiry" ADD COLUMN "submissionKey" TEXT;

-- Canonical values make email case and common Indian phone formats equivalent.
UPDATE "Volunteer"
SET "email" = LOWER(BTRIM("email"));

WITH normalized AS (
  SELECT
    "id",
    CASE
      WHEN LENGTH(digits) = 12 AND LEFT(digits, 2) = '91' THEN SUBSTRING(digits FROM 3)
      WHEN LENGTH(digits) = 11 AND LEFT(digits, 1) = '0' THEN SUBSTRING(digits FROM 2)
      ELSE digits
    END AS value
  FROM (
    SELECT "id", REGEXP_REPLACE("mobile", '[^0-9]', '', 'g') AS digits
    FROM "Volunteer"
  ) AS volunteer_numbers
)
UPDATE "Volunteer" AS volunteer
SET "mobile" = normalized.value
FROM normalized
WHERE volunteer."id" = normalized."id";

WITH request_values AS (
  SELECT
    *,
    REGEXP_REPLACE("phone", '[^0-9]', '', 'g') AS phone_digits
  FROM "BloodRequest"
), fingerprints AS (
  SELECT
    "id",
    MD5(CONCAT_WS('|',
      CASE
        WHEN LENGTH(phone_digits) = 12 AND LEFT(phone_digits, 2) = '91' THEN SUBSTRING(phone_digits FROM 3)
        WHEN LENGTH(phone_digits) = 11 AND LEFT(phone_digits, 1) = '0' THEN SUBSTRING(phone_digits FROM 2)
        ELSE phone_digits
      END,
      LOWER(REGEXP_REPLACE(BTRIM("patientName"), '\s+', ' ', 'g')),
      LOWER(REGEXP_REPLACE(BTRIM("bloodGroup"), '\s+', ' ', 'g')),
      "units"::TEXT,
      LOWER(REGEXP_REPLACE(BTRIM("urgency"), '\s+', ' ', 'g')),
      LOWER(REGEXP_REPLACE(BTRIM("hospital"), '\s+', ' ', 'g')),
      LOWER(REGEXP_REPLACE(BTRIM("district"), '\s+', ' ', 'g')),
      LOWER(REGEXP_REPLACE(BTRIM("location"), '\s+', ' ', 'g')),
      LOWER(REGEXP_REPLACE(BTRIM(COALESCE("doctorName", '')), '\s+', ' ', 'g')),
      FLOOR(EXTRACT(EPOCH FROM "createdAt") / 3600)::TEXT
    )) AS value
  FROM request_values
)
UPDATE "BloodRequest" AS request
SET "submissionKey" = fingerprints.value
FROM fingerprints
WHERE request."id" = fingerprints."id";

WITH fingerprints AS (
  SELECT
    "id",
    MD5(CONCAT_WS('|',
      LOWER(BTRIM("email")),
      LOWER(REGEXP_REPLACE(BTRIM("organization"), '\s+', ' ', 'g')),
      LOWER(REGEXP_REPLACE(BTRIM("contactPerson"), '\s+', ' ', 'g')),
      LOWER(REGEXP_REPLACE(BTRIM("message"), '\s+', ' ', 'g')),
      FLOOR(EXTRACT(EPOCH FROM "createdAt") / 3600)::TEXT
    )) AS value
  FROM "PartnerInquiry"
)
UPDATE "PartnerInquiry" AS inquiry
SET "submissionKey" = fingerprints.value
FROM fingerprints
WHERE inquiry."id" = fingerprints."id";

CREATE UNIQUE INDEX "Volunteer_email_key" ON "Volunteer"("email");
CREATE UNIQUE INDEX "Volunteer_mobile_key" ON "Volunteer"("mobile");
CREATE UNIQUE INDEX "BloodRequest_submissionKey_key" ON "BloodRequest"("submissionKey");
CREATE UNIQUE INDEX "PartnerInquiry_submissionKey_key" ON "PartnerInquiry"("submissionKey");

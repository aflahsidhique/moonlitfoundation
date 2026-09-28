-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Volunteer" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT,
    "passwordHash" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "fullName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "aadhaar" TEXT,
    "photoUrl" TEXT,
    "mobile" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "taluk" TEXT NOT NULL,
    "panchayat" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "emergencyName" TEXT NOT NULL,
    "emergencyRelationship" TEXT NOT NULL,
    "emergencyPhone" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "bloodGroup" TEXT,
    "isBloodDonor" BOOLEAN NOT NULL DEFAULT false,
    "lastBloodDonationDate" TIMESTAMP(3),
    "bloodDonationAvailable" BOOLEAN NOT NULL DEFAULT true,
    "weight" DOUBLE PRECISION,
    "medicalConditions" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "availableTime" TEXT NOT NULL,
    "instagram" TEXT,
    "facebook" TEXT,
    "linkedin" TEXT,
    "idType" TEXT,
    "idUploadUrl" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Volunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodRequest" (
    "id" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "bloodGroup" TEXT NOT NULL,
    "units" INTEGER NOT NULL,
    "urgency" TEXT NOT NULL,
    "hospital" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "doctorName" TEXT,
    "phone" TEXT NOT NULL,
    "documentUrls" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNote" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloodRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodRequestResponse" (
    "id" TEXT NOT NULL,
    "bloodRequestId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "response" TEXT,
    "status" TEXT NOT NULL DEFAULT 'notified',
    "respondedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloodRequestResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodDonationRecord" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "donationDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "bloodRequestId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BloodDonationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerInquiry" (
    "id" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unread',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "durationHours" DOUBLE PRECISION,
    "imageUrl" TEXT,
    "photoAlbumUrl" TEXT,
    "capacity" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "hoursCredited" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateIssued" BOOLEAN NOT NULL DEFAULT false,
    "certificateIssuedAt" TIMESTAMP(3),

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventFeedback" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'all',
    "volunteerId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_volunteerId_key" ON "Volunteer"("volunteerId");

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_passwordResetToken_key" ON "Volunteer"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "BloodRequestResponse_bloodRequestId_volunteerId_key" ON "BloodRequestResponse"("bloodRequestId", "volunteerId");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_volunteerId_eventId_key" ON "Attendance"("volunteerId", "eventId");

-- AddForeignKey
ALTER TABLE "BloodRequestResponse" ADD CONSTRAINT "BloodRequestResponse_bloodRequestId_fkey" FOREIGN KEY ("bloodRequestId") REFERENCES "BloodRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodRequestResponse" ADD CONSTRAINT "BloodRequestResponse_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodDonationRecord" ADD CONSTRAINT "BloodDonationRecord_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodDonationRecord" ADD CONSTRAINT "BloodDonationRecord_bloodRequestId_fkey" FOREIGN KEY ("bloodRequestId") REFERENCES "BloodRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFeedback" ADD CONSTRAINT "EventFeedback_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;


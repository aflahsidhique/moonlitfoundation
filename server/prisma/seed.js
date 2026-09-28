require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@moonlitfoundation.org").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.ADMIN_NAME || "Moonlit Admin";

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin ${email} already exists — skipping.`);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.admin.create({ data: { email, passwordHash, name } });
    console.log(`Created admin ${email} — log in at /admin with the password from your .env.`);
  }

  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    const inTwoWeeks = new Date();
    inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
    const inFourWeeks = new Date();
    inFourWeeks.setDate(inFourWeeks.getDate() + 28);

    await prisma.event.createMany({
      data: [
        {
          title: "Mega Blood Donation Camp",
          category: "Blood Donation",
          description:
            "Our biggest camp of the year, targeting 300 donors in a single day. Walk-ins welcome; every donor receives a health check and a Moonlit donor card.",
          location: "Govt. Medical College, Kozhikode",
          eventDate: inTwoWeeks,
          startTime: "9:00 AM",
          endTime: "4:00 PM",
          capacity: 300,
          status: "published"
        },
        {
          title: "Coastal Cleanup Drive",
          category: "Environment",
          description:
            "Join volunteers to clean the historic Kappad shoreline. Gloves, bags and breakfast provided — bring your energy and a water bottle.",
          location: "Kappad Beach, Kozhikode",
          eventDate: inFourWeeks,
          startTime: "6:30 AM",
          endTime: "10:00 AM",
          capacity: 150,
          status: "published"
        }
      ]
    });
    console.log("Seeded 2 sample published events.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Universities
  const universities = await Promise.all([
    prisma.university.upsert({
      where: { id: "uni-sapienza" },
      update: {},
      create: {
        id: "uni-sapienza",
        name: "Sapienza Università di Roma",
        shortName: "Sapienza",
        city: "Roma",
        emoji: "🏛️",
      },
    }),
    prisma.university.upsert({
      where: { id: "uni-bologna" },
      update: {},
      create: {
        id: "uni-bologna",
        name: "Università di Bologna",
        shortName: "UniBo",
        city: "Bologna",
        emoji: "📚",
      },
    }),
    prisma.university.upsert({
      where: { id: "uni-milano" },
      update: {},
      create: {
        id: "uni-milano",
        name: "Università Statale di Milano",
        shortName: "UniMi",
        city: "Milano",
        emoji: "🏙️",
      },
    }),
    prisma.university.upsert({
      where: { id: "uni-napoli" },
      update: {},
      create: {
        id: "uni-napoli",
        name: "Università Federico II di Napoli",
        shortName: "Federico II",
        city: "Napoli",
        emoji: "🌋",
      },
    }),
    prisma.university.upsert({
      where: { id: "uni-padova" },
      update: {},
      create: {
        id: "uni-padova",
        name: "Università di Padova",
        shortName: "UniPd",
        city: "Padova",
        emoji: "🎓",
      },
    }),
    prisma.university.upsert({
      where: { id: "uni-firenze" },
      update: {},
      create: {
        id: "uni-firenze",
        name: "Università di Firenze",
        shortName: "UniFi",
        city: "Firenze",
        emoji: "🌸",
      },
    }),
    prisma.university.upsert({
      where: { id: "uni-torino" },
      update: {},
      create: {
        id: "uni-torino",
        name: "Università di Torino",
        shortName: "UniTo",
        city: "Torino",
        emoji: "⛰️",
      },
    }),
    prisma.university.upsert({
      where: { id: "uni-cattolica" },
      update: {},
      create: {
        id: "uni-cattolica",
        name: "Università Cattolica del Sacro Cuore",
        shortName: "Cattolica",
        city: "Milano",
        emoji: "✝️",
      },
    }),
  ]);

  console.log(`✅ Created ${universities.length} universities`);

  // Channels for each university
  const channelNames = ["Canale A", "Canale B", "Canale C", "Canale D"];
  const createdChannels: { id: string; name: string; universityId: string }[] = [];

  for (const uni of universities) {
    for (const channelName of channelNames) {
      const channelId = `ch-${uni.id}-${channelName.replace("Canale ", "").toLowerCase()}`;
      const channel = await prisma.channel.upsert({
        where: { id: channelId },
        update: {},
        create: {
          id: channelId,
          name: channelName,
          universityId: uni.id,
        },
      });
      createdChannels.push(channel);
    }
  }

  console.log(`✅ Created ${createdChannels.length} channels`);

  // Subjects
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { id: "sub-anatomia1" },
      update: {},
      create: { id: "sub-anatomia1", name: "Anatomia I", emoji: "🫀", color: "red" },
    }),
    prisma.subject.upsert({
      where: { id: "sub-anatomia2" },
      update: {},
      create: { id: "sub-anatomia2", name: "Anatomia II", emoji: "🦴", color: "red" },
    }),
    prisma.subject.upsert({
      where: { id: "sub-fisiologia" },
      update: {},
      create: { id: "sub-fisiologia", name: "Fisiologia", emoji: "⚡", color: "yellow" },
    }),
    prisma.subject.upsert({
      where: { id: "sub-biochimica" },
      update: {},
      create: { id: "sub-biochimica", name: "Biochimica", emoji: "🧬", color: "green" },
    }),
    prisma.subject.upsert({
      where: { id: "sub-patologia" },
      update: {},
      create: { id: "sub-patologia", name: "Patologia", emoji: "🔬", color: "purple" },
    }),
    prisma.subject.upsert({
      where: { id: "sub-farmacologia" },
      update: {},
      create: { id: "sub-farmacologia", name: "Farmacologia", emoji: "💊", color: "blue" },
    }),
    prisma.subject.upsert({
      where: { id: "sub-microbiologia" },
      update: {},
      create: { id: "sub-microbiologia", name: "Microbiologia", emoji: "🦠", color: "teal" },
    }),
    prisma.subject.upsert({
      where: { id: "sub-istologia" },
      update: {},
      create: { id: "sub-istologia", name: "Istologia", emoji: "🔍", color: "pink" },
    }),
    prisma.subject.upsert({
      where: { id: "sub-neurologia" },
      update: {},
      create: { id: "sub-neurologia", name: "Neurologia", emoji: "🧠", color: "indigo" },
    }),
    prisma.subject.upsert({
      where: { id: "sub-cardiologia" },
      update: {},
      create: { id: "sub-cardiologia", name: "Cardiologia", emoji: "❤️", color: "rose" },
    }),
    prisma.subject.upsert({
      where: { id: "sub-chirurgia" },
      update: {},
      create: { id: "sub-chirurgia", name: "Chirurgia", emoji: "🏥", color: "gray" },
    }),
  ]);

  console.log(`✅ Created ${subjects.length} subjects`);

  // Test user (Sofia Marchetti)
  const passwordHash = await hash("password123", 12);

  // Get the Canale A for Sapienza
  const sapienzaChannelA = createdChannels.find(
    (ch) => ch.universityId === "uni-sapienza" && ch.name === "Canale A"
  );

  const testUser = await prisma.user.upsert({
    where: { email: "sofia@sapienza.it" },
    update: {},
    create: {
      email: "sofia@sapienza.it",
      passwordHash,
      name: "Sofia Marchetti",
      universityId: "uni-sapienza",
      year: 3, // Now a number (3º Anno)
      channelId: sapienzaChannelA?.id || null,
      isRepresentative: true,
      avatarUrl: null,
    },
  });

  console.log(`✅ Created test user: ${testUser.email}`);

  // Create some professors
  const professors = await Promise.all([
    prisma.professor.upsert({
      where: { id: "prof-rossi" },
      update: {},
      create: {
        id: "prof-rossi",
        name: "Prof. Mario Rossi",
        universityId: "uni-sapienza",
      },
    }),
    prisma.professor.upsert({
      where: { id: "prof-bianchi" },
      update: {},
      create: {
        id: "prof-bianchi",
        name: "Prof.ssa Anna Bianchi",
        universityId: "uni-sapienza",
      },
    }),
    prisma.professor.upsert({
      where: { id: "prof-verdi" },
      update: {},
      create: {
        id: "prof-verdi",
        name: "Prof. Giuseppe Verdi",
        universityId: "uni-sapienza",
      },
    }),
  ]);

  console.log(`✅ Created ${professors.length} professors`);

  // Link professors to subjects
  await prisma.professorSubject.upsert({
    where: { id: "ps-rossi-anatomia" },
    update: {},
    create: {
      id: "ps-rossi-anatomia",
      professorId: "prof-rossi",
      subjectId: "sub-anatomia1",
    },
  });

  await prisma.professorSubject.upsert({
    where: { id: "ps-bianchi-fisiologia" },
    update: {},
    create: {
      id: "ps-bianchi-fisiologia",
      professorId: "prof-bianchi",
      subjectId: "sub-fisiologia",
    },
  });

  await prisma.professorSubject.upsert({
    where: { id: "ps-verdi-cardiologia" },
    update: {},
    create: {
      id: "ps-verdi-cardiologia",
      professorId: "prof-verdi",
      subjectId: "sub-cardiologia",
    },
  });

  console.log("✅ Linked professors to subjects");

  // Create sample exams
  const exam1 = await prisma.exam.upsert({
    where: { id: "exam-anatomia-jan" },
    update: {},
    create: {
      id: "exam-anatomia-jan",
      subjectId: "sub-anatomia1",
      professorId: "prof-rossi",
      universityId: "uni-sapienza",
      year: 1, // Now a number (1º Anno)
      channelId: sapienzaChannelA?.id || null,
      examDate: new Date("2026-01-15"),
      examType: "orale",
      academicYear: "2025/2026",
      createdBy: testUser.id,
    },
  });

  // Create sample questions
  await prisma.question.upsert({
    where: { id: "q1-anatomia" },
    update: {},
    create: {
      id: "q1-anatomia",
      examId: exam1.id,
      text: "Descriva la struttura e la funzione del cuore, con particolare attenzione alle camere cardiache.",
      order: 1,
      timesAsked: 5,
      views: 47,
    },
  });

  await prisma.question.upsert({
    where: { id: "q2-anatomia" },
    update: {},
    create: {
      id: "q2-anatomia",
      examId: exam1.id,
      text: "Quali sono le principali arterie che irrorano il cervello?",
      order: 2,
      timesAsked: 3,
      views: 32,
    },
  });

  await prisma.question.upsert({
    where: { id: "q3-anatomia" },
    update: {},
    create: {
      id: "q3-anatomia",
      examId: exam1.id,
      text: "Descriva il percorso del sangue nel sistema circolatorio.",
      order: 3,
      timesAsked: 4,
      views: 28,
    },
  });

  console.log("✅ Created sample exam with questions");

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

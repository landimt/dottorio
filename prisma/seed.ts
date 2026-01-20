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

  // Courses for each university
  const courseNames = ["Canale A", "Canale B", "Canale C", "Canale D"];
  const createdCourses: { id: string; name: string; universityId: string }[] = [];

  for (const uni of universities) {
    for (const courseName of courseNames) {
      const courseId = `ch-${uni.id}-${courseName.replace("Canale ", "").toLowerCase()}`;
      const course = await prisma.course.upsert({
        where: { id: courseId },
        update: {},
        create: {
          id: courseId,
          name: courseName,
          universityId: uni.id,
        },
      });
      createdCourses.push(course);
    }
  }

  console.log(`✅ Created ${createdCourses.length} courses`);

  // Get the Canale A for Sapienza (for subjects)
  const sapienzaCourseAId = createdCourses.find(
    (c) => c.universityId === "uni-sapienza" && c.name === "Canale A"
  )?.id || createdCourses[0]?.id;

  // Subjects (now linked to a course)
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { id: "sub-anatomia1" },
      update: {},
      create: { id: "sub-anatomia1", name: "Anatomia I", emoji: "🫀", color: "red", courseId: sapienzaCourseAId, year: 1 },
    }),
    prisma.subject.upsert({
      where: { id: "sub-anatomia2" },
      update: {},
      create: { id: "sub-anatomia2", name: "Anatomia II", emoji: "🦴", color: "red", courseId: sapienzaCourseAId, year: 2 },
    }),
    prisma.subject.upsert({
      where: { id: "sub-fisiologia" },
      update: {},
      create: { id: "sub-fisiologia", name: "Fisiologia", emoji: "⚡", color: "yellow", courseId: sapienzaCourseAId, year: 2 },
    }),
    prisma.subject.upsert({
      where: { id: "sub-biochimica" },
      update: {},
      create: { id: "sub-biochimica", name: "Biochimica", emoji: "🧬", color: "green", courseId: sapienzaCourseAId, year: 1 },
    }),
    prisma.subject.upsert({
      where: { id: "sub-patologia" },
      update: {},
      create: { id: "sub-patologia", name: "Patologia", emoji: "🔬", color: "purple", courseId: sapienzaCourseAId, year: 3 },
    }),
    prisma.subject.upsert({
      where: { id: "sub-farmacologia" },
      update: {},
      create: { id: "sub-farmacologia", name: "Farmacologia", emoji: "💊", color: "blue", courseId: sapienzaCourseAId, year: 4 },
    }),
    prisma.subject.upsert({
      where: { id: "sub-microbiologia" },
      update: {},
      create: { id: "sub-microbiologia", name: "Microbiologia", emoji: "🦠", color: "teal", courseId: sapienzaCourseAId, year: 3 },
    }),
    prisma.subject.upsert({
      where: { id: "sub-istologia" },
      update: {},
      create: { id: "sub-istologia", name: "Istologia", emoji: "🔍", color: "pink", courseId: sapienzaCourseAId, year: 1 },
    }),
    prisma.subject.upsert({
      where: { id: "sub-neurologia" },
      update: {},
      create: { id: "sub-neurologia", name: "Neurologia", emoji: "🧠", color: "indigo", courseId: sapienzaCourseAId, year: 5 },
    }),
    prisma.subject.upsert({
      where: { id: "sub-cardiologia" },
      update: {},
      create: { id: "sub-cardiologia", name: "Cardiologia", emoji: "❤️", color: "rose", courseId: sapienzaCourseAId, year: 4 },
    }),
    prisma.subject.upsert({
      where: { id: "sub-chirurgia" },
      update: {},
      create: { id: "sub-chirurgia", name: "Chirurgia", emoji: "🏥", color: "gray", courseId: sapienzaCourseAId, year: 5 },
    }),
  ]);

  console.log(`✅ Created ${subjects.length} subjects`);

  // Hash password (demo123)
  const passwordHash = await hash("demo123", 12);

  // Get the Canale A for Sapienza (for users/exams)
  const sapienzaCourseA = createdCourses.find(
    (c) => c.universityId === "uni-sapienza" && c.name === "Canale A"
  );

  // Create ADMIN user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@dottorio.it" },
    update: {
      role: "admin",
      status: "active",
    },
    create: {
      email: "admin@dottorio.it",
      passwordHash,
      name: "Admin Dottorio",
      universityId: "uni-sapienza",
      year: 6,
      courseId: null,
      isRepresentative: false,
      role: "admin",
      status: "active",
      avatarUrl: null,
    },
  });

  console.log(`✅ Created ADMIN user: ${adminUser.email} (password: demo123)`);

  // Create test user (Sofia - Representative)
  const testUser = await prisma.user.upsert({
    where: { email: "sofia@sapienza.it" },
    update: {
      role: "representative",
      status: "active",
    },
    create: {
      email: "sofia@sapienza.it",
      passwordHash,
      name: "Sofia Marchetti",
      universityId: "uni-sapienza",
      year: 3,
      courseId: sapienzaCourseA?.id || null,
      isRepresentative: true,
      role: "representative",
      status: "active",
      avatarUrl: null,
    },
  });

  console.log(`✅ Created test user: ${testUser.email} (password: demo123)`);

  // Create more students
  const student1 = await prisma.user.upsert({
    where: { email: "marco.ferrari@sapienza.it" },
    update: {},
    create: {
      email: "marco.ferrari@sapienza.it",
      passwordHash,
      name: "Marco Ferrari",
      universityId: "uni-sapienza",
      year: 2,
      courseId: sapienzaCourseA?.id || null,
      isRepresentative: false,
      role: "student",
      status: "active",
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "giulia.romano@sapienza.it" },
    update: {},
    create: {
      email: "giulia.romano@sapienza.it",
      passwordHash,
      name: "Giulia Romano",
      universityId: "uni-sapienza",
      year: 3,
      courseId: sapienzaCourseA?.id || null,
      isRepresentative: false,
      role: "student",
      status: "active",
    },
  });

  console.log("✅ Created additional students (password: demo123)");

  // Create professors
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
    prisma.professor.upsert({
      where: { id: "prof-colombo" },
      update: {},
      create: {
        id: "prof-colombo",
        name: "Prof.ssa Laura Colombo",
        universityId: "uni-sapienza",
      },
    }),
    prisma.professor.upsert({
      where: { id: "prof-marino" },
      update: {},
      create: {
        id: "prof-marino",
        name: "Prof. Francesco Marino",
        universityId: "uni-sapienza",
      },
    }),
    prisma.professor.upsert({
      where: { id: "prof-conti" },
      update: {},
      create: {
        id: "prof-conti",
        name: "Prof.ssa Elena Conti",
        universityId: "uni-bologna",
      },
    }),
  ]);

  console.log(`✅ Created ${professors.length} professors`);

  // Link professors to subjects
  await Promise.all([
    prisma.professorSubject.upsert({
      where: { id: "ps-rossi-anatomia1" },
      update: {},
      create: {
        id: "ps-rossi-anatomia1",
        professorId: "prof-rossi",
        subjectId: "sub-anatomia1",
      },
    }),
    prisma.professorSubject.upsert({
      where: { id: "ps-rossi-anatomia2" },
      update: {},
      create: {
        id: "ps-rossi-anatomia2",
        professorId: "prof-rossi",
        subjectId: "sub-anatomia2",
      },
    }),
    prisma.professorSubject.upsert({
      where: { id: "ps-bianchi-fisiologia" },
      update: {},
      create: {
        id: "ps-bianchi-fisiologia",
        professorId: "prof-bianchi",
        subjectId: "sub-fisiologia",
      },
    }),
    prisma.professorSubject.upsert({
      where: { id: "ps-verdi-cardiologia" },
      update: {},
      create: {
        id: "ps-verdi-cardiologia",
        professorId: "prof-verdi",
        subjectId: "sub-cardiologia",
      },
    }),
    prisma.professorSubject.upsert({
      where: { id: "ps-colombo-biochimica" },
      update: {},
      create: {
        id: "ps-colombo-biochimica",
        professorId: "prof-colombo",
        subjectId: "sub-biochimica",
      },
    }),
    prisma.professorSubject.upsert({
      where: { id: "ps-marino-farmacologia" },
      update: {},
      create: {
        id: "ps-marino-farmacologia",
        professorId: "prof-marino",
        subjectId: "sub-farmacologia",
      },
    }),
    prisma.professorSubject.upsert({
      where: { id: "ps-conti-neurologia" },
      update: {},
      create: {
        id: "ps-conti-neurologia",
        professorId: "prof-conti",
        subjectId: "sub-neurologia",
      },
    }),
  ]);

  console.log("✅ Linked professors to subjects");

  // Create exams
  const exam1 = await prisma.exam.upsert({
    where: { id: "exam-anatomia-jan" },
    update: {},
    create: {
      id: "exam-anatomia-jan",
      subjectId: "sub-anatomia1",
      professorId: "prof-rossi",
      universityId: "uni-sapienza",
      year: 1,
      courseId: sapienzaCourseA?.id || null,
      examDate: new Date("2026-01-15"),
      examType: "orale",
      academicYear: "2025/2026",
      description: "Esame orale di Anatomia I - Gennaio 2026",
      createdBy: testUser.id,
    },
  });

  const exam2 = await prisma.exam.upsert({
    where: { id: "exam-fisiologia-feb" },
    update: {},
    create: {
      id: "exam-fisiologia-feb",
      subjectId: "sub-fisiologia",
      professorId: "prof-bianchi",
      universityId: "uni-sapienza",
      year: 2,
      courseId: sapienzaCourseA?.id || null,
      examDate: new Date("2026-02-10"),
      examType: "scritto",
      academicYear: "2025/2026",
      description: "Esame scritto di Fisiologia - Febbraio 2026",
      createdBy: testUser.id,
    },
  });

  const exam3 = await prisma.exam.upsert({
    where: { id: "exam-cardiologia-mar" },
    update: {},
    create: {
      id: "exam-cardiologia-mar",
      subjectId: "sub-cardiologia",
      professorId: "prof-verdi",
      universityId: "uni-sapienza",
      year: 4,
      courseId: sapienzaCourseA?.id || null,
      examDate: new Date("2026-03-20"),
      examType: "orale",
      academicYear: "2025/2026",
      description: "Esame orale di Cardiologia - Marzo 2026",
      createdBy: student1.id,
    },
  });

  console.log("✅ Created 3 exams");

  // Create questions with groupId and canonical system
  const groupId1 = "grp-cuore-struttura";
  const groupId2 = "grp-arterie-cervello";

  // Question Group 1: Cuore e struttura (canonical + 2 variations)
  const q1canonical = await prisma.question.upsert({
    where: { id: "q1-anatomia-canonical" },
    update: {},
    create: {
      id: "q1-anatomia-canonical",
      examId: exam1.id,
      text: "Descriva la struttura e la funzione del cuore, con particolare attenzione alle camere cardiache.",
      order: 1,
      timesAsked: 8,
      views: 127,
      groupId: groupId1,
      isCanonical: true,
      canonicalId: null,
    },
  });

  await prisma.question.upsert({
    where: { id: "q1-anatomia-var1" },
    update: {},
    create: {
      id: "q1-anatomia-var1",
      examId: exam1.id,
      text: "Mi parli dell'anatomia del cuore e delle sue camere.",
      order: 2,
      timesAsked: 3,
      views: 45,
      groupId: groupId1,
      isCanonical: false,
      canonicalId: q1canonical.id,
    },
  });

  await prisma.question.upsert({
    where: { id: "q1-anatomia-var2" },
    update: {},
    create: {
      id: "q1-anatomia-var2",
      examId: exam1.id,
      text: "Quali sono le caratteristiche anatomiche del cuore e come funzionano gli atri e i ventricoli?",
      order: 3,
      timesAsked: 5,
      views: 68,
      groupId: groupId1,
      isCanonical: false,
      canonicalId: q1canonical.id,
    },
  });

  // Question Group 2: Arterie del cervello (canonical + 1 variation)
  const q2canonical = await prisma.question.upsert({
    where: { id: "q2-anatomia-canonical" },
    update: {},
    create: {
      id: "q2-anatomia-canonical",
      examId: exam1.id,
      text: "Quali sono le principali arterie che irrorano il cervello?",
      order: 4,
      timesAsked: 6,
      views: 89,
      groupId: groupId2,
      isCanonical: true,
      canonicalId: null,
    },
  });

  await prisma.question.upsert({
    where: { id: "q2-anatomia-var1" },
    update: {},
    create: {
      id: "q2-anatomia-var1",
      examId: exam1.id,
      text: "Mi descriva il circolo arterioso cerebrale.",
      order: 5,
      timesAsked: 4,
      views: 52,
      groupId: groupId2,
      isCanonical: false,
      canonicalId: q2canonical.id,
    },
  });

  // More standalone questions
  await prisma.question.upsert({
    where: { id: "q3-anatomia" },
    update: {},
    create: {
      id: "q3-anatomia",
      examId: exam1.id,
      text: "Descriva il percorso del sangue nel sistema circolatorio.",
      order: 6,
      timesAsked: 7,
      views: 103,
      groupId: null,
      isCanonical: true,
    },
  });

  await prisma.question.upsert({
    where: { id: "q4-anatomia" },
    update: {},
    create: {
      id: "q4-anatomia",
      examId: exam1.id,
      text: "Quali sono le differenze tra arterie e vene?",
      order: 7,
      timesAsked: 4,
      views: 67,
      groupId: null,
      isCanonical: true,
    },
  });

  // Fisiologia questions
  await prisma.question.upsert({
    where: { id: "q1-fisiologia" },
    update: {},
    create: {
      id: "q1-fisiologia",
      examId: exam2.id,
      text: "Spieghi il meccanismo di contrazione muscolare.",
      order: 1,
      timesAsked: 5,
      views: 78,
      groupId: null,
      isCanonical: true,
    },
  });

  await prisma.question.upsert({
    where: { id: "q2-fisiologia" },
    update: {},
    create: {
      id: "q2-fisiologia",
      examId: exam2.id,
      text: "Come funziona il sistema nervoso autonomo?",
      order: 2,
      timesAsked: 6,
      views: 92,
      groupId: null,
      isCanonical: true,
    },
  });

  await prisma.question.upsert({
    where: { id: "q3-fisiologia" },
    update: {},
    create: {
      id: "q3-fisiologia",
      examId: exam2.id,
      text: "Descriva il processo di respirazione cellulare.",
      order: 3,
      timesAsked: 4,
      views: 61,
      groupId: null,
      isCanonical: true,
    },
  });

  // Cardiologia questions
  await prisma.question.upsert({
    where: { id: "q1-cardiologia" },
    update: {},
    create: {
      id: "q1-cardiologia",
      examId: exam3.id,
      text: "Quali sono le cause più comuni di infarto miocardico?",
      order: 1,
      timesAsked: 8,
      views: 134,
      groupId: null,
      isCanonical: true,
    },
  });

  await prisma.question.upsert({
    where: { id: "q2-cardiologia" },
    update: {},
    create: {
      id: "q2-cardiologia",
      examId: exam3.id,
      text: "Come si diagnostica e tratta l'insufficienza cardiaca?",
      order: 2,
      timesAsked: 6,
      views: 97,
      groupId: null,
      isCanonical: true,
    },
  });

  console.log("✅ Created 12 questions (with canonical system)");

  // Add student answers
  await prisma.studentAnswer.upsert({
    where: { id: "ans-1" },
    update: {},
    create: {
      id: "ans-1",
      questionId: "q1-anatomia-canonical",
      userId: testUser.id,
      content: "Il cuore è un organo muscolare diviso in quattro camere: due atri superiori e due ventricoli inferiori. L'atrio destro riceve sangue venoso dalla vena cava, il ventricolo destro lo pompa ai polmoni. L'atrio sinistro riceve sangue ossigenato dai polmoni e il ventricolo sinistro lo distribuisce al corpo attraverso l'aorta.",
      isPublic: true,
    },
  });

  await prisma.studentAnswer.upsert({
    where: { id: "ans-2" },
    update: {},
    create: {
      id: "ans-2",
      questionId: "q2-anatomia-canonical",
      userId: student1.id,
      content: "Le principali arterie cerebrali sono: arterie carotidi interne, arterie vertebrali che formano il circolo di Willis, arteria cerebrale anteriore, media e posteriore. Queste assicurano l'irrorazione costante del tessuto nervoso.",
      isPublic: true,
    },
  });

  console.log("✅ Created student answers");

  // Add comments
  await prisma.comment.upsert({
    where: { id: "comm-1" },
    update: {},
    create: {
      id: "comm-1",
      questionId: "q1-anatomia-canonical",
      userId: student2.id,
      content: "Questa domanda è uscita anche al mio esame! Il prof ha apprezzato molto quando ho parlato del setto interventricolare.",
    },
  });

  await prisma.comment.upsert({
    where: { id: "comm-2" },
    update: {},
    create: {
      id: "comm-2",
      questionId: "q1-cardiologia",
      userId: testUser.id,
      content: "Importante menzionare aterosclerosi coronarica, trombosi e spasmo coronarico. Il prof chiede sempre i fattori di rischio!",
    },
  });

  console.log("✅ Created comments");

  // Add some saved questions
  await prisma.savedQuestion.upsert({
    where: { id: "saved-1" },
    update: {},
    create: {
      id: "saved-1",
      userId: testUser.id,
      questionId: "q1-anatomia-canonical",
    },
  });

  await prisma.savedQuestion.upsert({
    where: { id: "saved-2" },
    update: {},
    create: {
      id: "saved-2",
      userId: testUser.id,
      questionId: "q1-cardiologia",
    },
  });

  console.log("✅ Created saved questions");

  console.log("\n🎉 Seeding completed!");
  console.log("\n📋 Login credentials:");
  console.log("   Admin:  admin@dottorio.it / demo123");
  console.log("   Sofia:  sofia@sapienza.it / demo123");
  console.log("   Marco:  marco.ferrari@sapienza.it / demo123");
  console.log("   Giulia: giulia.romano@sapienza.it / demo123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

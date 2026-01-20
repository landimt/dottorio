import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import * as fs from "fs";
import * as path from "path";
import { uuidv7 } from "uuidv7";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Tipagem do JSON de dados
interface SapienzaData {
  scrapedAt: string;
  university: string;
  courses: {
    code: string;
    name: string;
    location: string;
    academicYear: string;
    subjects: {
      code: string;
      name: string;
      ssd: string[];
      language: string;
      year: number;
      semester: number;
      cfu: number;
      professors: { name: string; channel: string }[];
      detailUrl: string;
      isModule: boolean;
    }[];
  }[];
}

// Helper para normalizar nomes para comparação
function normalizeKey(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Helper para capitalizar nomes
function capitalizeName(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Emojis por tipo de matéria
function getSubjectEmoji(name: string): string {
  const nameUpper = name.toUpperCase();
  if (nameUpper.includes("FISICA")) return "⚡";
  if (nameUpper.includes("BIOLOGIA")) return "🧬";
  if (nameUpper.includes("CHIMICA") || nameUpper.includes("BIOCHIMICA")) return "🧪";
  if (nameUpper.includes("ANATOMIA")) return "🫀";
  if (nameUpper.includes("FISIOLOGIA")) return "⚙️";
  if (nameUpper.includes("ISTOLOGIA")) return "🔬";
  if (nameUpper.includes("GINECOLOGIA") || nameUpper.includes("OSTETRICIA")) return "👶";
  if (nameUpper.includes("METODOLOGIA") || nameUpper.includes("LEGALE")) return "⚖️";
  if (nameUpper.includes("EPISTEMOLOGIA") || nameUpper.includes("STORIA")) return "📚";
  if (nameUpper.includes("ADE")) return "📋";
  if (nameUpper.includes("PROVA FINALE")) return "🎓";
  return "📖";
}

// Cores por tipo de matéria
function getSubjectColor(name: string): string {
  const nameUpper = name.toUpperCase();
  if (nameUpper.includes("FISICA")) return "blue";
  if (nameUpper.includes("BIOLOGIA")) return "green";
  if (nameUpper.includes("CHIMICA") || nameUpper.includes("BIOCHIMICA")) return "purple";
  if (nameUpper.includes("ANATOMIA")) return "red";
  if (nameUpper.includes("FISIOLOGIA")) return "yellow";
  if (nameUpper.includes("ISTOLOGIA")) return "pink";
  if (nameUpper.includes("GINECOLOGIA") || nameUpper.includes("OSTETRICIA")) return "rose";
  if (nameUpper.includes("METODOLOGIA") || nameUpper.includes("LEGALE")) return "gray";
  if (nameUpper.includes("EPISTEMOLOGIA") || nameUpper.includes("STORIA")) return "amber";
  return "slate";
}

async function main() {
  console.log("🌱 Seeding database with Sapienza Medicina data...\n");

  // Load JSON data
  const dataPath = path.join(process.cwd(), "data", "sapienza-medicina.json");
  const rawData = fs.readFileSync(dataPath, "utf-8");
  const sapienzaData: SapienzaData = JSON.parse(rawData);

  // ============================================
  // 1. UNIVERSIDADE
  // ============================================
  console.log("🏛️  Creating university...");

  // Try to find existing university by name, otherwise create new
  let university = await prisma.university.findFirst({
    where: { name: "Sapienza Università di Roma" },
  });

  if (!university) {
    university = await prisma.university.create({
      data: {
        id: uuidv7(),
        name: "Sapienza Università di Roma",
        shortName: "Sapienza",
        city: "Roma",
        emoji: "🏛️",
      },
    });
  }
  console.log(`   ✅ ${university.name}`);

  // ============================================
  // 2. CURSOS (Medicina A, B, C)
  // ============================================
  console.log("\n📚 Creating courses...");

  const coursesMap = new Map<string, { id: string; name: string }>();

  for (const courseData of sapienzaData.courses) {
    // Try to find existing course by unique constraint (universityId + name)
    let course = await prisma.course.findFirst({
      where: {
        universityId: university.id,
        name: courseData.name,
      },
    });

    if (!course) {
      course = await prisma.course.create({
        data: {
          id: uuidv7(),
          name: courseData.name,
          universityId: university.id,
          description: courseData.location,
        },
      });
    }
    coursesMap.set(courseData.code, { id: course.id, name: course.name });
    console.log(`   ✅ ${course.name}`);
  }

  // ============================================
  // 3. MATÉRIAS (únicas, vinculadas ao primeiro curso)
  // ============================================
  console.log("\n📖 Creating subjects...");

  // Coletar todas as matérias únicas (por código)
  const uniqueSubjects = new Map<string, {
    code: string;
    name: string;
    year: number;
    semester: number;
    cfu: number;
    courseId: string;
  }>();

  for (const courseData of sapienzaData.courses) {
    const courseInfo = coursesMap.get(courseData.code);
    if (!courseInfo) continue;

    for (const subject of courseData.subjects) {
      // Ignorar matérias sem nome significativo ou duplicadas
      if (!uniqueSubjects.has(subject.code) && subject.name && subject.name !== "ADE" && subject.name !== "PROVA FINALE") {
        uniqueSubjects.set(subject.code, {
          code: subject.code,
          name: subject.name,
          year: subject.year,
          semester: subject.semester,
          cfu: subject.cfu,
          courseId: courseInfo.id,
        });
      }
    }
  }

  const subjectsMap = new Map<string, string>(); // code -> id

  for (const [code, subjectData] of uniqueSubjects) {
    // Try to find existing subject by unique constraint (courseId + name)
    let subject = await prisma.subject.findFirst({
      where: {
        courseId: subjectData.courseId,
        name: subjectData.name,
      },
    });

    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          id: uuidv7(),
          name: subjectData.name,
          courseId: subjectData.courseId,
          emoji: getSubjectEmoji(subjectData.name),
          color: getSubjectColor(subjectData.name),
          year: subjectData.year,
          semester: subjectData.semester,
          credits: subjectData.cfu,
        },
      });
    }
    subjectsMap.set(code, subject.id);
    console.log(`   ✅ ${subject.name} (${subjectData.cfu} CFU, ${subjectData.year}º ano)`);
  }

  // ============================================
  // 4. PROFESSORES (únicos)
  // ============================================
  console.log("\n👨‍🏫 Creating professors...");

  // Coletar todos os professores únicos
  const uniqueProfessors = new Map<string, {
    name: string;
    subjects: Set<string>; // códigos das matérias
  }>();

  for (const courseData of sapienzaData.courses) {
    for (const subject of courseData.subjects) {
      for (const prof of subject.professors) {
        const profKey = normalizeKey(prof.name);
        if (!uniqueProfessors.has(profKey)) {
          uniqueProfessors.set(profKey, {
            name: capitalizeName(prof.name),
            subjects: new Set([subject.code]),
          });
        } else {
          uniqueProfessors.get(profKey)!.subjects.add(subject.code);
        }
      }
    }
  }

  const professorsMap = new Map<string, string>(); // normalizedName -> id

  for (const [profKey, profData] of uniqueProfessors) {
    // Try to find existing professor by name and university
    let professor = await prisma.professor.findFirst({
      where: {
        name: profData.name,
        universityId: university.id,
      },
    });

    if (!professor) {
      professor = await prisma.professor.create({
        data: {
          id: uuidv7(),
          name: profData.name,
          universityId: university.id,
        },
      });
    }
    professorsMap.set(profKey, professor.id);
    console.log(`   ✅ ${professor.name}`);
  }

  console.log(`\n   📊 Total: ${professorsMap.size} professores`);

  // ============================================
  // 5. VÍNCULO PROFESSOR-MATÉRIA
  // ============================================
  console.log("\n🔗 Linking professors to subjects...");

  let linkCount = 0;
  for (const [profKey, profData] of uniqueProfessors) {
    const profId = professorsMap.get(profKey);
    if (!profId) continue;

    for (const subjectCode of profData.subjects) {
      const subjectId = subjectsMap.get(subjectCode);
      if (!subjectId) continue;

      // Try to find existing link by unique constraint (professorId + subjectId)
      const existingLink = await prisma.professorSubject.findFirst({
        where: {
          professorId: profId,
          subjectId: subjectId,
        },
      });

      if (!existingLink) {
        await prisma.professorSubject.create({
          data: {
            id: uuidv7(),
            professorId: profId,
            subjectId: subjectId,
          },
        });
      }
      linkCount++;
    }
  }
  console.log(`   ✅ ${linkCount} vínculos criados`);

  // ============================================
  // 5.1. MATÉRIAS ADICIONAIS PARA TODOS OS ANOS (Só Medicina A)
  // ============================================
  console.log("\n📚 Creating additional subjects for all years (Medicina A only)...");

  // Get Medicina A course ID
  const medicinaAId = coursesMap.get("33452")?.id;

  if (medicinaAId) {
    // Subjects organized by year - realistic Italian medical school curriculum
    const additionalSubjects = [
      // Anno 1
      { name: "Anatomia Umana I", year: 1, semester: 1, cfu: 9, emoji: "🫀", color: "red" },
      { name: "Istologia ed Embriologia", year: 1, semester: 1, cfu: 6, emoji: "🔬", color: "pink" },
      { name: "Biochimica I", year: 1, semester: 2, cfu: 8, emoji: "🧪", color: "purple" },
      { name: "Informatica e Statistica Medica", year: 1, semester: 2, cfu: 4, emoji: "💻", color: "blue" },

      // Anno 2
      { name: "Anatomia Umana II", year: 2, semester: 1, cfu: 9, emoji: "🫀", color: "red" },
      { name: "Biochimica II", year: 2, semester: 1, cfu: 8, emoji: "🧪", color: "purple" },
      { name: "Fisiologia I", year: 2, semester: 2, cfu: 10, emoji: "⚙️", color: "yellow" },
      { name: "Microbiologia e Microbiologia Clinica", year: 2, semester: 2, cfu: 6, emoji: "🦠", color: "green" },
      { name: "Immunologia", year: 2, semester: 2, cfu: 5, emoji: "🛡️", color: "blue" },

      // Anno 3
      { name: "Fisiologia II", year: 3, semester: 1, cfu: 8, emoji: "⚙️", color: "yellow" },
      { name: "Patologia Generale", year: 3, semester: 1, cfu: 10, emoji: "🏥", color: "orange" },
      { name: "Farmacologia I", year: 3, semester: 2, cfu: 8, emoji: "💊", color: "cyan" },
      { name: "Semeiotica Medica", year: 3, semester: 2, cfu: 6, emoji: "🩺", color: "teal" },
      { name: "Anatomia Patologica I", year: 3, semester: 2, cfu: 6, emoji: "🔬", color: "rose" },

      // Anno 4
      { name: "Farmacologia II", year: 4, semester: 1, cfu: 8, emoji: "💊", color: "cyan" },
      { name: "Anatomia Patologica II", year: 4, semester: 1, cfu: 6, emoji: "🔬", color: "rose" },
      { name: "Medicina Interna I", year: 4, semester: 1, cfu: 10, emoji: "🏥", color: "blue" },
      { name: "Chirurgia Generale I", year: 4, semester: 2, cfu: 8, emoji: "🔪", color: "red" },
      { name: "Diagnostica per Immagini", year: 4, semester: 2, cfu: 6, emoji: "📷", color: "gray" },
      { name: "Malattie Infettive", year: 4, semester: 2, cfu: 5, emoji: "🦠", color: "green" },

      // Anno 5
      { name: "Medicina Interna II", year: 5, semester: 1, cfu: 10, emoji: "🏥", color: "blue" },
      { name: "Chirurgia Generale II", year: 5, semester: 1, cfu: 8, emoji: "🔪", color: "red" },
      { name: "Pediatria", year: 5, semester: 1, cfu: 8, emoji: "👶", color: "pink" },
      { name: "Neurologia", year: 5, semester: 2, cfu: 6, emoji: "🧠", color: "purple" },
      { name: "Psichiatria", year: 5, semester: 2, cfu: 5, emoji: "🧠", color: "violet" },
      { name: "Dermatologia", year: 5, semester: 2, cfu: 4, emoji: "🩹", color: "amber" },
      { name: "Otorinolaringoiatria", year: 5, semester: 2, cfu: 4, emoji: "👂", color: "orange" },

      // Anno 6
      { name: "Medicina d'Urgenza", year: 6, semester: 1, cfu: 8, emoji: "🚑", color: "red" },
      { name: "Anestesiologia e Rianimazione", year: 6, semester: 1, cfu: 6, emoji: "💉", color: "blue" },
      { name: "Oncologia Medica", year: 6, semester: 1, cfu: 5, emoji: "🎗️", color: "pink" },
      { name: "Medicina Legale", year: 6, semester: 2, cfu: 5, emoji: "⚖️", color: "gray" },
      { name: "Igiene e Sanità Pubblica", year: 6, semester: 2, cfu: 6, emoji: "🏛️", color: "green" },
      { name: "Ortopedia e Traumatologia", year: 6, semester: 2, cfu: 5, emoji: "🦴", color: "white" },
    ];

    // Professors for each subject (invented Italian names)
    const additionalProfessors = [
      // Anno 1
      { name: "Prof. Alessandro Vitali", subjects: ["Anatomia Umana I"] },
      { name: "Prof.ssa Elena Santini", subjects: ["Istologia ed Embriologia"] },
      { name: "Prof. Giovanni Moretti", subjects: ["Biochimica I"] },
      { name: "Prof.ssa Chiara Lombardi", subjects: ["Informatica e Statistica Medica"] },

      // Anno 2
      { name: "Prof. Roberto Mancini", subjects: ["Anatomia Umana II"] },
      { name: "Prof.ssa Paola Ferretti", subjects: ["Biochimica II"] },
      { name: "Prof. Stefano Colombo", subjects: ["Fisiologia I"] },
      { name: "Prof.ssa Lucia Martinelli", subjects: ["Microbiologia e Microbiologia Clinica"] },
      { name: "Prof. Andrea Rinaldi", subjects: ["Immunologia"] },

      // Anno 3
      { name: "Prof. Francesco Barbieri", subjects: ["Fisiologia II"] },
      { name: "Prof.ssa Maria Giusti", subjects: ["Patologia Generale"] },
      { name: "Prof. Paolo Benedetti", subjects: ["Farmacologia I"] },
      { name: "Prof.ssa Silvia Cattaneo", subjects: ["Semeiotica Medica"] },
      { name: "Prof. Massimo Pellegrini", subjects: ["Anatomia Patologica I"] },

      // Anno 4
      { name: "Prof.ssa Federica Costa", subjects: ["Farmacologia II"] },
      { name: "Prof. Alberto Fontana", subjects: ["Anatomia Patologica II"] },
      { name: "Prof. Lorenzo Galli", subjects: ["Medicina Interna I"] },
      { name: "Prof.ssa Giuliana Marini", subjects: ["Chirurgia Generale I"] },
      { name: "Prof. Nicola Sartori", subjects: ["Diagnostica per Immagini"] },
      { name: "Prof.ssa Teresa Fabbri", subjects: ["Malattie Infettive"] },

      // Anno 5
      { name: "Prof. Enrico Monti", subjects: ["Medicina Interna II"] },
      { name: "Prof. Claudio Donati", subjects: ["Chirurgia Generale II"] },
      { name: "Prof.ssa Valentina Riva", subjects: ["Pediatria"] },
      { name: "Prof. Gabriele Parisi", subjects: ["Neurologia"] },
      { name: "Prof.ssa Alessandra Longo", subjects: ["Psichiatria"] },
      { name: "Prof. Marco Testa", subjects: ["Dermatologia"] },
      { name: "Prof.ssa Serena Bassi", subjects: ["Otorinolaringoiatria"] },

      // Anno 6
      { name: "Prof. Filippo Caruso", subjects: ["Medicina d'Urgenza"] },
      { name: "Prof.ssa Roberta Gentile", subjects: ["Anestesiologia e Rianimazione"] },
      { name: "Prof. Antonio Silvestri", subjects: ["Oncologia Medica"] },
      { name: "Prof. Matteo Rizzo", subjects: ["Medicina Legale"] },
      { name: "Prof.ssa Laura Bernardi", subjects: ["Igiene e Sanità Pubblica"] },
      { name: "Prof. Simone Ferri", subjects: ["Ortopedia e Traumatologia"] },
    ];

    // Create additional subjects
    const additionalSubjectsMap = new Map<string, string>(); // name -> id

    for (const subj of additionalSubjects) {
      // Check if subject already exists
      let subject = await prisma.subject.findFirst({
        where: {
          courseId: medicinaAId,
          name: subj.name,
        },
      });

      if (!subject) {
        subject = await prisma.subject.create({
          data: {
            id: uuidv7(),
            name: subj.name,
            courseId: medicinaAId,
            emoji: subj.emoji,
            color: subj.color,
            year: subj.year,
            semester: subj.semester,
            credits: subj.cfu,
          },
        });
        console.log(`   ✅ ${subject.name} (${subj.cfu} CFU, ${subj.year}º ano)`);
      }
      additionalSubjectsMap.set(subj.name, subject.id);
    }

    // Create additional professors and link to subjects
    console.log("\n👨‍🏫 Creating additional professors...");

    for (const prof of additionalProfessors) {
      // Check if professor already exists
      let professor = await prisma.professor.findFirst({
        where: {
          name: prof.name,
          universityId: university.id,
        },
      });

      if (!professor) {
        professor = await prisma.professor.create({
          data: {
            id: uuidv7(),
            name: prof.name,
            universityId: university.id,
          },
        });
        console.log(`   ✅ ${professor.name}`);
      }

      // Link professor to subjects
      for (const subjectName of prof.subjects) {
        const subjectId = additionalSubjectsMap.get(subjectName);
        if (!subjectId) continue;

        const existingLink = await prisma.professorSubject.findFirst({
          where: {
            professorId: professor.id,
            subjectId: subjectId,
          },
        });

        if (!existingLink) {
          await prisma.professorSubject.create({
            data: {
              id: uuidv7(),
              professorId: professor.id,
              subjectId: subjectId,
            },
          });
        }
      }
    }
  }

  // ============================================
  // 6. USUÁRIOS
  // ============================================
  console.log("\n👥 Creating users...");

  const passwordHash = await hash("demo123", 12);

  // Pegar o primeiro curso (Medicina A) para os usuários
  const defaultCourseId = coursesMap.get("33452")?.id || Array.from(coursesMap.values())[0]?.id;

  // Admin - upsert by email (unique)
  const admin = await prisma.user.upsert({
    where: { email: "admin@dottorio.it" },
    update: { role: "admin", status: "active" },
    create: {
      id: uuidv7(),
      email: "admin@dottorio.it",
      passwordHash,
      name: "Admin Dottorio",
      universityId: university.id,
      courseId: null,
      year: 6,
      isRepresentative: false,
      role: "admin",
      status: "active",
    },
  });
  console.log(`   ✅ ${admin.name} (${admin.email}) - Admin`);

  // Super Admin - upsert by email (unique)
  const superAdmin = await prisma.user.upsert({
    where: { email: "super@dottorio.it" },
    update: { role: "super_admin", status: "active" },
    create: {
      id: uuidv7(),
      email: "super@dottorio.it",
      passwordHash,
      name: "Super Admin",
      universityId: university.id,
      courseId: null,
      year: 6,
      isRepresentative: false,
      role: "super_admin",
      status: "active",
    },
  });
  console.log(`   ✅ ${superAdmin.name} (${superAdmin.email}) - Super Admin`);

  // Representante - upsert by email (unique)
  const representative = await prisma.user.upsert({
    where: { email: "sofia@sapienza.it" },
    update: { role: "representative", status: "active" },
    create: {
      id: uuidv7(),
      email: "sofia@sapienza.it",
      passwordHash,
      name: "Sofia Marchetti",
      universityId: university.id,
      courseId: defaultCourseId,
      year: 3,
      isRepresentative: true,
      role: "representative",
      status: "active",
    },
  });
  console.log(`   ✅ ${representative.name} (${representative.email}) - Representante`);

  // Estudantes
  const students = [
    { email: "marco@sapienza.it", name: "Marco Ferrari", year: 2 },
    { email: "giulia@sapienza.it", name: "Giulia Romano", year: 3 },
    { email: "luca@sapienza.it", name: "Luca Bianchi", year: 1 },
    { email: "chiara@sapienza.it", name: "Chiara Rossi", year: 4 },
    { email: "matteo@sapienza.it", name: "Matteo Conti", year: 2 },
    { email: "alessia@sapienza.it", name: "Alessia Marino", year: 5 },
    { email: "davide@sapienza.it", name: "Davide Greco", year: 1 },
    { email: "francesca@sapienza.it", name: "Francesca Ricci", year: 6 },
  ];

  const createdStudents = [];
  for (const student of students) {
    // upsert by email (unique)
    const user = await prisma.user.upsert({
      where: { email: student.email },
      update: {},
      create: {
        id: uuidv7(),
        email: student.email,
        passwordHash,
        name: student.name,
        universityId: university.id,
        courseId: defaultCourseId,
        year: student.year,
        isRepresentative: false,
        role: "student",
        status: "active",
      },
    });
    createdStudents.push(user);
    console.log(`   ✅ ${user.name} (${user.email}) - ${user.year}º ano`);
  }

  // ============================================
  // 7. EXAMES DE EXEMPLO
  // ============================================
  console.log("\n📝 Creating sample exams...");

  // Pegar algumas matérias e professores para criar exames
  const subjectIds = Array.from(subjectsMap.values());
  const professorIds = Array.from(professorsMap.values());

  const examData = [
    { subjectIdx: 0, profIdx: 0, year: 1, date: "2026-01-15" },
    { subjectIdx: 1, profIdx: 5, year: 1, date: "2026-02-10" },
    { subjectIdx: 2, profIdx: 10, year: 1, date: "2026-02-20" },
  ];

  const createdExams = [];
  for (let i = 0; i < examData.length; i++) {
    const ed = examData[i];
    if (!subjectIds[ed.subjectIdx] || !professorIds[ed.profIdx]) continue;

    // Create exam with UUIDv7
    const exam = await prisma.exam.create({
      data: {
        id: uuidv7(),
        subjectId: subjectIds[ed.subjectIdx],
        professorId: professorIds[ed.profIdx],
        universityId: university.id,
        courseId: defaultCourseId,
        year: ed.year,
        examDate: new Date(ed.date),
        examType: i % 2 === 0 ? "orale" : "scritto",
        academicYear: "2025/2026",
        createdBy: representative.id,
      },
    });
    createdExams.push(exam);
    console.log(`   ✅ Esame ${i + 1}`);
  }

  // ============================================
  // 8. PERGUNTAS DE EXEMPLO
  // ============================================
  console.log("\n❓ Creating sample questions...");

  const sampleQuestions = [
    // Física
    { text: "Descriva le leggi di Newton e le loro applicazioni nel corpo umano.", timesAsked: 8, views: 127 },
    { text: "Come si calcola il lavoro compiuto da una forza? Fornisca un esempio.", timesAsked: 5, views: 89 },
    { text: "Spieghi il principio di conservazione dell'energia.", timesAsked: 6, views: 102 },
    // Biologia
    { text: "Descriva la struttura e la funzione della membrana cellulare.", timesAsked: 12, views: 234 },
    { text: "Quali sono le fasi del ciclo cellulare? Descriva brevemente ciascuna.", timesAsked: 10, views: 198 },
    { text: "Spieghi il processo di trascrizione del DNA.", timesAsked: 8, views: 156 },
    // Chimica
    { text: "Descriva la struttura degli amminoacidi e il legame peptidico.", timesAsked: 15, views: 312 },
    { text: "Quali sono le differenze tra reazioni endotermiche ed esotermiche?", timesAsked: 7, views: 134 },
    { text: "Spieghi il concetto di pH e la scala di acidità.", timesAsked: 9, views: 167 },
  ];

  const createdQuestions: { id: string; examId: string }[] = [];
  let questionIdx = 0;
  for (const exam of createdExams) {
    for (let i = 0; i < 3 && questionIdx < sampleQuestions.length; i++) {
      const q = sampleQuestions[questionIdx];
      const groupId = uuidv7();

      const question = await prisma.question.create({
        data: {
          id: uuidv7(),
          examId: exam.id,
          text: q.text,
          order: i + 1,
          timesAsked: q.timesAsked,
          views: q.views,
          groupId: groupId,
          isCanonical: true,
        },
      });
      createdQuestions.push({ id: question.id, examId: exam.id });
      questionIdx++;
    }
  }
  console.log(`   ✅ ${questionIdx} domande create`);

  // ============================================
  // 9. RESPOSTAS DE ESTUDANTES
  // ============================================
  console.log("\n💬 Creating sample answers...");

  // Create answers only if we have questions
  if (createdQuestions.length > 0) {
    await prisma.studentAnswer.create({
      data: {
        id: uuidv7(),
        questionId: createdQuestions[0].id, // First question
        userId: representative.id,
        content: "Le tre leggi di Newton sono: 1) Principio di inerzia - un corpo permane nel suo stato di quiete o moto rettilineo uniforme a meno che non intervenga una forza esterna. 2) F=ma - la forza è uguale alla massa per l'accelerazione. 3) Principio di azione e reazione - ad ogni azione corrisponde una reazione uguale e contraria.",
        isPublic: true,
      },
    });
  }

  if (createdQuestions.length > 3 && createdStudents.length > 0) {
    await prisma.studentAnswer.create({
      data: {
        id: uuidv7(),
        questionId: createdQuestions[3].id, // Fourth question
        userId: createdStudents[0].id,
        content: "La membrana cellulare è composta da un doppio strato fosfolipidico con proteine integrali e periferiche. Ha funzioni di: barriera selettiva, trasporto di molecole, comunicazione cellulare e adesione.",
        isPublic: true,
      },
    });
  }

  console.log("   ✅ Respostas de exemplo criadas");

  // ============================================
  // 10. COMENTÁRIOS
  // ============================================
  console.log("\n📝 Creating sample comments...");

  // Create comments only if we have questions and students
  if (createdQuestions.length > 0 && createdStudents.length > 1) {
    await prisma.comment.create({
      data: {
        id: uuidv7(),
        questionId: createdQuestions[0].id, // First question
        userId: createdStudents[1].id,
        content: "Questa domanda è uscita anche al mio esame! Il prof ha apprezzato quando ho fatto esempi pratici.",
      },
    });
  }

  if (createdQuestions.length > 3 && createdStudents.length > 2) {
    await prisma.comment.create({
      data: {
        id: uuidv7(),
        questionId: createdQuestions[3].id, // Fourth question
        userId: createdStudents[2].id,
        content: "Importante ricordare anche il modello a mosaico fluido di Singer e Nicolson!",
      },
    });
  }

  console.log("   ✅ Comentários de exemplo criados");

  // ============================================
  // RESUMO FINAL
  // ============================================
  console.log("\n" + "=".repeat(60));
  console.log("🎉 SEEDING COMPLETADO COM SUCESSO!");
  console.log("=".repeat(60));
  console.log(`
📊 Resumo:
   • 1 universidade (Sapienza)
   • ${coursesMap.size} cursos de Medicina
   • ${subjectsMap.size} matérias
   • ${professorsMap.size} professores
   • ${linkCount} vínculos professor-matéria
   • ${2 + students.length + 1} usuários
   • ${createdExams.length} exames
   • ${questionIdx} perguntas

📋 Credenciais de Acesso (senha: demo123):
   ┌────────────────────────────────────────┐
   │ Super Admin: super@dottorio.it        │
   │ Admin:       admin@dottorio.it        │
   │ Representante: sofia@sapienza.it      │
   │ Estudante:   marco@sapienza.it        │
   │ Estudante:   giulia@sapienza.it       │
   │ Estudante:   luca@sapienza.it         │
   │ ... e mais ${students.length - 3} estudantes              │
   └────────────────────────────────────────┘
`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

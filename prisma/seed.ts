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

// Tipagem do JSON de questões
interface SeedQuestion {
  text: string;
  timesAsked: number;
  views: number;
}

interface SeedQuestionsData {
  description: string;
  createdAt: string;
  totalQuestions: number;
  questions: {
    anatomiaPatologica: SeedQuestion[];
    anatomiaUmana: SeedQuestion[];
    biologia: SeedQuestion[];
    fisica: SeedQuestion[];
    chimica: SeedQuestion[];
    fisiologia: SeedQuestion[];
    istologia: SeedQuestion[];
    farmacologia: SeedQuestion[];
    patologiaGenerale: SeedQuestion[];
    microbiologia: SeedQuestion[];
    medicinaInterna: SeedQuestion[];
    chirurgiaGenerale: SeedQuestion[];
    neurologia: SeedQuestion[];
    pediatria: SeedQuestion[];
    semeiotica: SeedQuestion[];
  };
}

// Tipagem do JSON de questões de Anatomia Umana I (300 questões)
interface AnatomiaUmanaQuestionsData {
  description: string;
  createdAt: string;
  subject: string;
  totalQuestions: number;
  questions: SeedQuestion[];
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

  // Anatomia
  if (nameUpper.includes("ANATOMIA PATOLOGICA")) return "🔬";
  if (nameUpper.includes("ANATOMIA")) return "🫀";

  // Ciências básicas
  if (nameUpper.includes("FISICA")) return "⚡";
  if (nameUpper.includes("BIOLOGIA")) return "🧬";
  if (nameUpper.includes("CHIMICA") || nameUpper.includes("BIOCHIMICA")) return "🧪";
  if (nameUpper.includes("FISIOLOGIA")) return "⚙️";
  if (nameUpper.includes("ISTOLOGIA")) return "🔬";

  // Patologia e Farmacologia
  if (nameUpper.includes("PATOLOGIA")) return "🏥";
  if (nameUpper.includes("FARMACOLOGIA")) return "💊";

  // Microbiologia e Immunologia
  if (nameUpper.includes("MICROBIOLOGIA") || nameUpper.includes("MALATTIE INFETTIVE")) return "🦠";
  if (nameUpper.includes("IMMUNOLOGIA")) return "🛡️";

  // Neurologia e Psichiatria
  if (nameUpper.includes("NEUROLOGIA") || nameUpper.includes("PSICHIATRIA")) return "🧠";

  // Especialidades médicas
  if (nameUpper.includes("CARDIOLOGIA")) return "❤️";
  if (nameUpper.includes("PEDIATRIA")) return "👶";
  if (nameUpper.includes("GINECOLOGIA") || nameUpper.includes("OSTETRICIA")) return "👶";
  if (nameUpper.includes("DERMATOLOGIA")) return "🩹";
  if (nameUpper.includes("ONCOLOGIA")) return "🎗️";
  if (nameUpper.includes("OTORINOLARINGOIATRIA")) return "👂";
  if (nameUpper.includes("ORTOPEDIA")) return "🦴";

  // Cirurgia e Urgência
  if (nameUpper.includes("CHIRURGIA")) return "🔪";
  if (nameUpper.includes("URGENZA")) return "🚑";
  if (nameUpper.includes("ANESTESIOLOGIA")) return "💉";

  // Medicina interna e diagnóstico
  if (nameUpper.includes("MEDICINA INTERNA")) return "🏥";
  if (nameUpper.includes("SEMEIOTICA")) return "🩺";
  if (nameUpper.includes("DIAGNOSTICA") || nameUpper.includes("RADIOLOGIA")) return "📷";

  // Saúde pública e legal
  if (nameUpper.includes("IGIENE")) return "🏛️";
  if (nameUpper.includes("METODOLOGIA") || nameUpper.includes("LEGALE")) return "⚖️";
  if (nameUpper.includes("EPISTEMOLOGIA") || nameUpper.includes("STORIA")) return "📚";

  // Informatica
  if (nameUpper.includes("INFORMATICA")) return "💻";

  return "📖";
}

// Cores por tipo de matéria (usando valores do SubjectColor enum)
function getSubjectColor(name: string): string {
  const nameUpper = name.toUpperCase();

  // Anatomia
  if (nameUpper.includes("ANATOMIA PATOLOGICA")) return "rose";
  if (nameUpper.includes("ANATOMIA")) return "red";

  // Ciências básicas
  if (nameUpper.includes("FISICA")) return "blue";
  if (nameUpper.includes("BIOLOGIA")) return "green";
  if (nameUpper.includes("CHIMICA") || nameUpper.includes("BIOCHIMICA")) return "purple";
  if (nameUpper.includes("FISIOLOGIA")) return "yellow";
  if (nameUpper.includes("ISTOLOGIA")) return "pink";

  // Patologia e Farmacologia
  if (nameUpper.includes("PATOLOGIA")) return "orange";
  if (nameUpper.includes("FARMACOLOGIA")) return "cyan";

  // Microbiologia e Immunologia
  if (nameUpper.includes("MICROBIOLOGIA") || nameUpper.includes("MALATTIE INFETTIVE")) return "green";
  if (nameUpper.includes("IMMUNOLOGIA")) return "blue";

  // Neurologia e Psichiatria
  if (nameUpper.includes("NEUROLOGIA")) return "purple";
  if (nameUpper.includes("PSICHIATRIA")) return "violet";

  // Especialidades médicas
  if (nameUpper.includes("CARDIOLOGIA")) return "red";
  if (nameUpper.includes("PEDIATRIA")) return "pink";
  if (nameUpper.includes("GINECOLOGIA") || nameUpper.includes("OSTETRICIA")) return "rose";
  if (nameUpper.includes("DERMATOLOGIA")) return "amber";
  if (nameUpper.includes("ONCOLOGIA")) return "pink";
  if (nameUpper.includes("OTORINOLARINGOIATRIA")) return "orange";
  if (nameUpper.includes("ORTOPEDIA")) return "white";

  // Cirurgia e Urgência
  if (nameUpper.includes("CHIRURGIA") || nameUpper.includes("URGENZA")) return "red";
  if (nameUpper.includes("ANESTESIOLOGIA")) return "blue";

  // Medicina interna e diagnóstico
  if (nameUpper.includes("MEDICINA INTERNA")) return "blue";
  if (nameUpper.includes("SEMEIOTICA")) return "teal";
  if (nameUpper.includes("DIAGNOSTICA") || nameUpper.includes("RADIOLOGIA")) return "gray";

  // Saúde pública e legal
  if (nameUpper.includes("IGIENE")) return "green";
  if (nameUpper.includes("METODOLOGIA") || nameUpper.includes("LEGALE")) return "gray";
  if (nameUpper.includes("EPISTEMOLOGIA") || nameUpper.includes("STORIA")) return "amber";

  // Informatica
  if (nameUpper.includes("INFORMATICA")) return "blue";

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
  // 7. CARREGAR QUESTÕES DOS ARQUIVOS EXTERNOS
  // ============================================
  console.log("\n📂 Loading questions from seed files...");

  // Arquivo principal de questões
  const questionsPath = path.join(process.cwd(), "data", "seed-questions.json");
  const questionsRawData = fs.readFileSync(questionsPath, "utf-8");
  const seedQuestionsData: SeedQuestionsData = JSON.parse(questionsRawData);
  console.log(`   📊 Questões gerais: ${seedQuestionsData.totalQuestions}`);

  // Arquivo de 300 questões de Anatomia Umana I
  const anatomiaPath = path.join(process.cwd(), "data", "seed-questions-anatomia-humana.json");
  const anatomiaRawData = fs.readFileSync(anatomiaPath, "utf-8");
  const anatomiaQuestionsData: AnatomiaUmanaQuestionsData = JSON.parse(anatomiaRawData);
  console.log(`   📊 Questões Anatomia Umana I: ${anatomiaQuestionsData.totalQuestions}`);

  // ============================================
  // 8. EXAMES DE EXEMPLO
  // ============================================
  console.log("\n📝 Creating sample exams...");

  // Pegar algumas matérias e professores para criar exames (fallback)
  const subjectIds = Array.from(subjectsMap.values());
  const professorIds = Array.from(professorsMap.values());

  // Mapeamento de matérias do JSON para nomes no banco
  const subjectMapping: { key: keyof typeof seedQuestionsData.questions; dbName: string; year: number }[] = [
    { key: "anatomiaPatologica", dbName: "Anatomia Patologica", year: 3 },
    { key: "anatomiaUmana", dbName: "Anatomia Umana", year: 1 },
    { key: "biologia", dbName: "BIOLOGIA", year: 1 },
    { key: "fisica", dbName: "FISICA", year: 1 },
    { key: "chimica", dbName: "CHIMICA", year: 1 },
    { key: "fisiologia", dbName: "Fisiologia", year: 2 },
    { key: "istologia", dbName: "Istologia", year: 1 },
    { key: "farmacologia", dbName: "Farmacologia", year: 3 },
    { key: "patologiaGenerale", dbName: "Patologia Generale", year: 3 },
    { key: "microbiologia", dbName: "Microbiologia", year: 2 },
    { key: "medicinaInterna", dbName: "Medicina Interna", year: 4 },
    { key: "chirurgiaGenerale", dbName: "Chirurgia Generale", year: 4 },
    { key: "neurologia", dbName: "Neurologia", year: 5 },
    { key: "pediatria", dbName: "Pediatria", year: 5 },
    { key: "semeiotica", dbName: "Semeiotica", year: 3 },
  ];

  const createdExams: { id: string; subjectName: keyof typeof seedQuestionsData.questions }[] = [];
  const examDates = ["2025-06-15", "2025-09-10", "2026-01-20"];

  for (const mapping of subjectMapping) {
    // Buscar a matéria no banco
    const subject = await prisma.subject.findFirst({
      where: { name: { contains: mapping.dbName } },
    });

    if (!subject) {
      console.log(`   ⚠️  Matéria não encontrada: ${mapping.dbName}`);
      continue;
    }

    // Buscar um professor associado (se houver)
    const profSubject = await prisma.professorSubject.findFirst({
      where: { subjectId: subject.id },
      include: { professor: true },
    });

    // Criar 3 exames por matéria (datas diferentes)
    for (let i = 0; i < examDates.length; i++) {
      const exam = await prisma.exam.create({
        data: {
          id: uuidv7(),
          subjectId: subject.id,
          professorId: profSubject?.professor.id || professorIds[0],
          universityId: university.id,
          courseId: defaultCourseId,
          year: mapping.year,
          examDate: new Date(examDates[i]),
          examType: i % 2 === 0 ? "orale" : "scritto",
          academicYear: "2025/2026",
          createdBy: representative.id,
        },
      });
      createdExams.push({ id: exam.id, subjectName: mapping.key });
    }
    console.log(`   ✅ 3 Esami ${mapping.dbName}`);
  }

  console.log(`   📊 Total de exames criados: ${createdExams.length}`);

  // ============================================
  // 8.1. EXAMES ESPECIAIS DE ANATOMIA UMANA I (300 questões)
  // ============================================
  console.log("\n📝 Creating Anatomia Umana I exams (300 questions)...");

  // Buscar a matéria Anatomia Umana I
  const anatomiaUmanaISubject = await prisma.subject.findFirst({
    where: { name: "Anatomia Umana I", courseId: medicinaAId },
  });

  // Buscar professor de Anatomia
  const anatomiaProf = await prisma.professor.findFirst({
    where: { name: { contains: "Vitali" } },
  });

  const anatomiaExams: { id: string }[] = [];

  if (anatomiaUmanaISubject) {
    // Criar 10 exames para distribuir as 300 questões (~30 por exame)
    const anatomiaExamDates = [
      "2024-06-10", "2024-09-05", "2025-01-15",
      "2025-06-12", "2025-09-08", "2026-01-18",
      "2024-07-15", "2024-11-20", "2025-02-25",
      "2025-07-10"
    ];

    for (let i = 0; i < anatomiaExamDates.length; i++) {
      const exam = await prisma.exam.create({
        data: {
          id: uuidv7(),
          subjectId: anatomiaUmanaISubject.id,
          professorId: anatomiaProf?.id || professorIds[0],
          universityId: university.id,
          courseId: defaultCourseId,
          year: 1,
          examDate: new Date(anatomiaExamDates[i]),
          examType: i % 2 === 0 ? "orale" : "scritto",
          academicYear: i < 3 ? "2023/2024" : (i < 6 ? "2024/2025" : "2025/2026"),
          createdBy: representative.id,
        },
      });
      anatomiaExams.push({ id: exam.id });
    }
    console.log(`   ✅ ${anatomiaExams.length} exames de Anatomia Umana I criados`);
  }

  // ============================================
  // 9. PERGUNTAS DE EXEMPLO
  // ============================================
  console.log("\n❓ Creating sample questions...");

  const createdQuestions: { id: string; examId: string }[] = [];
  let questionIdx = 0;

  // Contador de questões por matéria (para distribuir entre os exames)
  const questionCounters: Record<string, number> = {};
  for (const mapping of subjectMapping) {
    questionCounters[mapping.key] = 0;
  }

  // Distribuir questões entre os exames de cada matéria
  for (const exam of createdExams) {
    const questions = seedQuestionsData.questions[exam.subjectName];
    if (!questions || questions.length === 0) continue;

    // Cada exame recebe ~10 questões (distribuídas entre os 3 exames)
    const questionsPerExam = Math.ceil(questions.length / 3);
    const startIdx = questionCounters[exam.subjectName];
    const endIdx = Math.min(startIdx + questionsPerExam, questions.length);

    for (let i = startIdx; i < endIdx; i++) {
      const q = questions[i];
      const groupId = uuidv7();

      const question = await prisma.question.create({
        data: {
          id: uuidv7(),
          examId: exam.id,
          text: q.text,
          order: i - startIdx + 1,
          timesAsked: q.timesAsked,
          views: q.views,
          groupId: groupId,
          isCanonical: true,
        },
      });
      createdQuestions.push({ id: question.id, examId: exam.id });
      questionIdx++;
    }

    questionCounters[exam.subjectName] = endIdx;
  }

  console.log(`   ✅ ${questionIdx} domande create (questões gerais)`);

  // ============================================
  // 9.1. QUESTÕES DE ANATOMIA UMANA I (300 questões)
  // ============================================
  console.log("\n❓ Creating Anatomia Umana I questions (300)...");

  let anatomiaQuestionIdx = 0;
  const questionsPerAnatomiaExam = Math.ceil(anatomiaQuestionsData.questions.length / anatomiaExams.length);

  for (let examIdx = 0; examIdx < anatomiaExams.length; examIdx++) {
    const exam = anatomiaExams[examIdx];
    const startIdx = examIdx * questionsPerAnatomiaExam;
    const endIdx = Math.min(startIdx + questionsPerAnatomiaExam, anatomiaQuestionsData.questions.length);

    for (let i = startIdx; i < endIdx; i++) {
      const q = anatomiaQuestionsData.questions[i];
      const groupId = uuidv7();

      const question = await prisma.question.create({
        data: {
          id: uuidv7(),
          examId: exam.id,
          text: q.text,
          order: i - startIdx + 1,
          timesAsked: q.timesAsked,
          views: q.views,
          groupId: groupId,
          isCanonical: true,
        },
      });
      createdQuestions.push({ id: question.id, examId: exam.id });
      anatomiaQuestionIdx++;
    }
  }

  console.log(`   ✅ ${anatomiaQuestionIdx} domande de Anatomia Umana I create`);
  console.log(`   📊 Total geral: ${questionIdx + anatomiaQuestionIdx} questões`);

  // ============================================
  // 10. RESPOSTAS DE ESTUDANTES
  // ============================================
  console.log("\n💬 Creating sample answers...");

  // Create answers only if we have questions
  if (createdQuestions.length > 0) {
    await prisma.studentAnswer.create({
      data: {
        id: uuidv7(),
        questionId: createdQuestions[0].id, // First question (Anatomia Patologica)
        userId: representative.id,
        content: "La necrosi è una morte cellulare patologica caratterizzata da: rigonfiamento cellulare, rottura della membrana, rilascio del contenuto citoplasmatico e risposta infiammatoria. L'apoptosi invece è una morte cellulare programmata con: condensazione della cromatina, formazione di corpi apoptotici, membrana intatta e assenza di infiammazione. La necrosi è irreversibile e danneggia i tessuti circostanti, mentre l'apoptosi è un processo fisiologico di eliminazione cellulare controllata.",
        isPublic: true,
      },
    });
  }

  if (createdQuestions.length > 6 && createdStudents.length > 0) {
    await prisma.studentAnswer.create({
      data: {
        id: uuidv7(),
        questionId: createdQuestions[6].id, // Anatomia Umana question
        userId: createdStudents[0].id,
        content: "Il cuore è diviso in 4 cavità: 2 atri (superiori) e 2 ventricoli (inferiori). Le valvole atrioventricolari (mitrale a sinistra, tricuspide a destra) separano atri e ventricoli. Le valvole semilunari (aortica e polmonare) separano i ventricoli dalle arterie. Il sistema di conduzione include: nodo senoatriale (pacemaker), nodo atrioventricolare, fascio di His e fibre di Purkinje.",
        isPublic: true,
      },
    });
  }

  if (createdQuestions.length > 12 && createdStudents.length > 1) {
    await prisma.studentAnswer.create({
      data: {
        id: uuidv7(),
        questionId: createdQuestions[12].id, // Biologia question
        userId: createdStudents[1].id,
        content: "Il DNA ha una struttura a doppia elica antiparallela, con le basi azotate rivolte verso l'interno (A-T con 2 legami H, G-C con 3 legami H). La replicazione semiconservativa prevede: 1) Separazione dei filamenti da elicasi, 2) Sintesi di primer da primasi, 3) Allungamento da DNA polimerasi III (5'→3'), 4) Sostituzione primer e ligazione da DNA polimerasi I e ligasi. Ogni molecola figlia contiene un filamento parentale e uno neosintetizzato.",
        isPublic: true,
      },
    });
  }

  console.log("   ✅ Respostas de exemplo criadas");

  // ============================================
  // 11. COMENTÁRIOS
  // ============================================
  console.log("\n📝 Creating sample comments...");

  // Create comments only if we have questions and students
  if (createdQuestions.length > 0 && createdStudents.length > 2) {
    await prisma.comment.create({
      data: {
        id: uuidv7(),
        questionId: createdQuestions[0].id,
        userId: createdStudents[2].id,
        content: "Questa domanda è uscita anche al mio esame! Il prof ha chiesto di fare esempi pratici delle differenze morfologiche.",
      },
    });
  }

  if (createdQuestions.length > 6 && createdStudents.length > 3) {
    await prisma.comment.create({
      data: {
        id: uuidv7(),
        questionId: createdQuestions[6].id,
        userId: createdStudents[3].id,
        content: "Il professore vuole sapere anche i rapporti del cuore con esofago, aorta discendente e vena cava.",
      },
    });
  }

  if (createdQuestions.length > 12 && createdStudents.length > 4) {
    await prisma.comment.create({
      data: {
        id: uuidv7(),
        questionId: createdQuestions[12].id,
        userId: createdStudents[4].id,
        content: "Ricordatevi l'esperimento di Meselson-Stahl che ha dimostrato la natura semiconservativa della replicazione!",
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
   • ${subjectsMap.size} matérias base + matérias adicionais
   • ${professorsMap.size} professores base + professores adicionais
   • ${linkCount} vínculos professor-matéria
   • ${2 + students.length + 1} usuários
   • ${createdExams.length + anatomiaExams.length} exames total
   • ${questionIdx + anatomiaQuestionIdx} perguntas total

📚 Questões por Matéria:
   • Anatomia Umana I: ${anatomiaQuestionsData.totalQuestions} questões (arquivo especial)
   • Anatomia Patológica: ${seedQuestionsData.questions.anatomiaPatologica.length} questões
   • Anatomia Umana (geral): ${seedQuestionsData.questions.anatomiaUmana.length} questões
   • Biologia: ${seedQuestionsData.questions.biologia.length} questões
   • Fisica: ${seedQuestionsData.questions.fisica.length} questões
   • Chimica/Biochimica: ${seedQuestionsData.questions.chimica.length} questões
   • Fisiologia: ${seedQuestionsData.questions.fisiologia.length} questões
   • Istologia: ${seedQuestionsData.questions.istologia.length} questões
   • Farmacologia: ${seedQuestionsData.questions.farmacologia.length} questões
   • Patologia Generale: ${seedQuestionsData.questions.patologiaGenerale.length} questões
   • Microbiologia: ${seedQuestionsData.questions.microbiologia.length} questões
   • Medicina Interna: ${seedQuestionsData.questions.medicinaInterna.length} questões
   • Chirurgia Generale: ${seedQuestionsData.questions.chirurgiaGenerale.length} questões
   • Neurologia: ${seedQuestionsData.questions.neurologia.length} questões
   • Pediatria: ${seedQuestionsData.questions.pediatria.length} questões
   • Semeiotica: ${seedQuestionsData.questions.semeiotica.length} questões

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

import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

// Configuração dos cursos de Medicina e Chirurgia da Sapienza
const COURSES = [
  { code: "33452", name: 'Medicina e chirurgia "A"', location: "Roma Policlinico Umberto I" },
  { code: "33559", name: 'Medicina e chirurgia "B"', location: "Roma Policlinico Umberto I" },
  { code: "33560", name: 'Medicina e chirurgia "C"', location: "Roma Policlinico Umberto I" },
  { code: "33561", name: 'Medicina e chirurgia "D"', location: "Roma Policlinico Umberto I" },
  { code: "33453", name: 'Medicina e chirurgia "E"', location: "Polo Pontino" },
  { code: "33454", name: 'Medicina e chirurgia "F"', location: "Roma (English)", lang: "ENG" },
  { code: "32925", name: 'Medicina e chirurgia "G"', location: "Polo di Rieti" },
  { code: "33562", name: "Medicina e chirurgia HT", location: "Roma" },
  { code: "33567", name: "Medicina e chirurgia", location: "Roma Sant'Andrea" },
];

const BASE_URL = "https://corsidilaurea.uniroma1.it";
const DELAY_MS = 500; // Delay entre requisições para não sobrecarregar o servidor

interface Professor {
  name: string;
  channel: string; // "Canale 1", "Canale 2", etc.
}

interface Subject {
  code: string;
  name: string;
  ssd: string[];
  language: string;
  year: number;
  semester: number;
  cfu: number;
  professors: Professor[];
  detailUrl?: string;
  isModule: boolean;
  parentSubject?: string;
}

interface Course {
  code: string;
  name: string;
  location: string;
  lang?: string;
  academicYear: string;
  subjects: Subject[];
}

interface ScrapingResult {
  scrapedAt: string;
  university: string;
  courses: Course[];
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(url: string): Promise<string> {
  console.log(`  Fetching: ${url}`);
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.text();
}

function parseSubjectsFromTable($: cheerio.CheerioAPI): Subject[] {
  const subjects: Subject[] = [];

  // Encontrar a tabela de curricula
  const table = $("table").first();
  if (!table.length) {
    console.log("    [WARN] Tabela de disciplinas não encontrada");
    return subjects;
  }

  // Processar cada linha da tabela
  const rows = table.find("tr").toArray();
  let currentYear = 1;
  let currentSemester = 1;
  let parentSubject: string | undefined;

  for (const row of rows) {
    const $row = $(row);
    const cells = $row.find("td");

    if (cells.length === 0) continue;

    // Verificar se é uma linha de cabeçalho de ano/semestre
    const headerText = $row.text().trim();
    const yearMatch = headerText.match(/(\d+)[°º]\s*anno/i);
    const semesterMatch = headerText.match(/(\d+)[°º]\s*semestre/i);

    if (yearMatch) currentYear = parseInt(yearMatch[1]);
    if (semesterMatch) currentSemester = parseInt(semesterMatch[1]);

    // Procurar código e nome da disciplina
    const codeCell = cells.first();
    const codeText = codeCell.text().trim();

    // Verificar se é um código válido (número ou AAF...)
    const codeMatch = codeText.match(/^(\d{6,}|AAF\d+|TPVES\d+)/i);
    if (!codeMatch) continue;

    const code = codeMatch[1];

    // Procurar o link da disciplina
    const link = $row.find("a").first();
    const name = link.length ? link.text().trim() : "";
    const href = link.attr("href") || "";

    if (!name) continue;

    // Extrair SSD (entre colchetes)
    const rowText = $row.text();
    const ssdMatch = rowText.match(/\[([A-Z]{2,4}[\/-]\d{2}[^[\]]*)\]/g);
    const ssd = ssdMatch
      ? ssdMatch
          .map(s => s.replace(/[\[\]]/g, "").trim())
          .filter(s => s && !s.includes("ITA") && !s.includes("ENG"))
          .flatMap(s => s.split(",").map(part => part.trim()))
          .filter(s => s.length > 0)
      : [];

    // Extrair língua
    const langMatch = rowText.match(/\[(ITA|ENG)\]/);
    const language = langMatch ? langMatch[1] : "ITA";

    // Extrair CFU (última coluna numérica)
    const cfuMatch = rowText.match(/(\d+)\s*$/);
    const cfu = cfuMatch ? parseInt(cfuMatch[1]) : 0;

    // Verificar se é módulo (tem ícone de expansão ou está indentado)
    const isModule = $row.find(".fa-list, .icon-list").length > 0 ||
                     $row.hasClass("module") ||
                     name.includes(" - ");

    // Se o nome contém " - ", é provavelmente um módulo
    const isSubModule = name.includes(" - ") && !name.startsWith("METODOLOGIA");

    if (!isSubModule && !name.includes("ADE")) {
      parentSubject = name;
    }

    subjects.push({
      code,
      name,
      ssd,
      language,
      year: currentYear,
      semester: currentSemester,
      cfu,
      professors: [],
      detailUrl: href ? `${BASE_URL}${href}` : undefined,
      isModule,
      parentSubject: isSubModule ? parentSubject : undefined,
    });
  }

  return subjects;
}

async function fetchProfessorsForSubject(url: string): Promise<Professor[]> {
  const professors: Professor[] = [];

  try {
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    // A estrutura do HTML é:
    // <div class="lesson-canale">
    //   <div class="canale-header">Canale 1</div>
    //   <div class="canale-docente">
    //     <div class="canale-docente-header">
    //       <span class="docente-name">NOME PROFESSOR</span>
    //       <a href="...">Scheda docente</a>
    //     </div>
    //   </div>
    // </div>

    // Iterar por cada bloco de canale
    $(".lesson-canale").each((_, canaleEl) => {
      const $canale = $(canaleEl);

      // Extrair nome do canal
      const channelHeader = $canale.find(".canale-header").first().text().trim();
      const channel = channelHeader || "Canale 1";

      // Extrair todos os professores deste canal
      const seenNames = new Set<string>();
      $canale.find(".docente-name").each((_, docenteEl) => {
        const name = $(docenteEl).text().trim();

        // Validar e deduplicar
        if (name && name.length > 3 && !seenNames.has(name)) {
          seenNames.add(name);
          professors.push({ name, channel });
        }
      });
    });

    // Fallback: se não encontrou com a estrutura acima, tentar buscar diretamente
    if (professors.length === 0) {
      const seenNames = new Set<string>();
      $(".docente-name").each((_, el) => {
        const name = $(el).text().trim();
        if (name && name.length > 3 && !seenNames.has(name)) {
          seenNames.add(name);
          // Tentar encontrar o canal no contexto
          const parentText = $(el).parents().slice(0, 5).text();
          const channelMatch = parentText.match(/Canale\s+(\d+)/i);
          const channel = channelMatch ? `Canale ${channelMatch[1]}` : "Canale 1";
          professors.push({ name, channel });
        }
      });
    }

  } catch (error) {
    console.log(`    [ERROR] Falha ao buscar professores: ${error}`);
  }

  return professors;
}

async function scrapeCourse(courseConfig: typeof COURSES[0]): Promise<Course> {
  console.log(`\nProcessando: ${courseConfig.name} (${courseConfig.code})`);

  const lessonsUrl = `${BASE_URL}/it/course/${courseConfig.code}/attendance/lessons-plan`;

  const course: Course = {
    code: courseConfig.code,
    name: courseConfig.name,
    location: courseConfig.location,
    lang: courseConfig.lang,
    academicYear: "2025/2026",
    subjects: [],
  };

  try {
    const html = await fetchPage(lessonsUrl);
    const $ = cheerio.load(html);

    // Extrair ano acadêmico
    const yearMatch = $("select option:selected, .academic-year").text().match(/(\d{4}\/\d{4})/);
    if (yearMatch) {
      course.academicYear = yearMatch[1];
    }

    // Parsear disciplinas da tabela
    course.subjects = parseSubjectsFromTable($);
    console.log(`  Encontradas ${course.subjects.length} disciplinas`);

    // Para cada disciplina com URL de detalhe, buscar professores
    let processedCount = 0;
    for (const subject of course.subjects) {
      if (subject.detailUrl && !subject.detailUrl.includes("undefined")) {
        await delay(DELAY_MS);
        subject.professors = await fetchProfessorsForSubject(subject.detailUrl);
        processedCount++;

        if (processedCount % 10 === 0) {
          console.log(`  Processadas ${processedCount}/${course.subjects.length} disciplinas...`);
        }
      }
    }

    console.log(`  Total de professores encontrados: ${course.subjects.reduce((acc, s) => acc + s.professors.length, 0)}`);

  } catch (error) {
    console.error(`  [ERROR] Falha ao processar curso: ${error}`);
  }

  return course;
}

async function main() {
  console.log("=".repeat(60));
  console.log("SCRAPING - Sapienza Medicina e Chirurgia");
  console.log("=".repeat(60));
  console.log(`Iniciando em: ${new Date().toISOString()}`);
  console.log(`Total de cursos: ${COURSES.length}`);

  const result: ScrapingResult = {
    scrapedAt: new Date().toISOString(),
    university: "Sapienza Università di Roma",
    courses: [],
  };

  // Processar apenas os primeiros 2 cursos para teste inicial
  const coursesToProcess = COURSES; // Altere para COURSES.slice(0, 2) para teste

  for (const courseConfig of coursesToProcess) {
    const course = await scrapeCourse(courseConfig);
    result.courses.push(course);

    // Salvar resultado parcial
    const outputPath = path.join(__dirname, "../data/sapienza-medicina.json");
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
    console.log(`  Salvo em: ${outputPath}`);

    await delay(1000); // Delay maior entre cursos
  }

  // Estatísticas finais
  console.log("\n" + "=".repeat(60));
  console.log("ESTATÍSTICAS FINAIS");
  console.log("=".repeat(60));

  let totalSubjects = 0;
  let totalProfessors = 0;
  const uniqueProfessors = new Set<string>();

  for (const course of result.courses) {
    totalSubjects += course.subjects.length;
    for (const subject of course.subjects) {
      totalProfessors += subject.professors.length;
      subject.professors.forEach(p => uniqueProfessors.add(p.name));
    }
    console.log(`${course.name}: ${course.subjects.length} disciplinas`);
  }

  console.log(`\nTotal de disciplinas: ${totalSubjects}`);
  console.log(`Total de atribuições professor-disciplina: ${totalProfessors}`);
  console.log(`Professores únicos: ${uniqueProfessors.size}`);
  console.log(`\nFinalizado em: ${new Date().toISOString()}`);
}

main().catch(console.error);

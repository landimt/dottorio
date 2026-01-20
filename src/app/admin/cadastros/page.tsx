import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { UniversitiesList } from "./_components/universities-list";

async function getUniversities() {
  return prisma.university.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          professors: true,
          users: true,
          courses: true,
        },
      },
    },
  });
}

export default async function CadastrosPage() {
  const universities = await getUniversities();
  const t = await getTranslations("admin.registriesPage");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <UniversitiesList universities={universities} />
    </div>
  );
}

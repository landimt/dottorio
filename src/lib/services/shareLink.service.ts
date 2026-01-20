import { prisma } from "@/lib/prisma";

const LINK_EXPIRATION_DAYS = 7;
const SLUG_LENGTH = 8;
const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function generateSlug(): string {
  let slug = "";
  for (let i = 0; i < SLUG_LENGTH; i++) {
    slug += SLUG_CHARS.charAt(Math.floor(Math.random() * SLUG_CHARS.length));
  }
  return slug;
}

function getExpirationDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + LINK_EXPIRATION_DAYS);
  return date;
}

export const shareLinkService = {
  async create(examId: string, userId: string) {
    // Check if a non-expired link already exists for this exam and user
    const existingLink = await prisma.shareLink.findFirst({
      where: {
        examId,
        createdById: userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        exam: {
          include: {
            subject: true,
            professor: true,
            university: true,
            course: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (existingLink) {
      return existingLink;
    }

    const slug = generateSlug();
    const expiresAt = getExpirationDate();

    return prisma.shareLink.create({
      data: {
        slug,
        examId,
        createdById: userId,
        expiresAt,
      },
      include: {
        exam: {
          include: {
            subject: true,
            professor: true,
            university: true,
            course: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  async findBySlug(slug: string) {
    const shareLink = await prisma.shareLink.findUnique({
      where: { slug },
      include: {
        exam: {
          include: {
            subject: true,
            professor: true,
            university: true,
            course: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!shareLink) {
      return null;
    }

    // Check if expired
    if (new Date() > shareLink.expiresAt) {
      return { ...shareLink, isExpired: true };
    }

    return { ...shareLink, isExpired: false };
  },

  async incrementClickCount(slug: string) {
    return prisma.shareLink.update({
      where: { slug },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    });
  },

  async findByUser(userId: string) {
    return prisma.shareLink.findMany({
      where: { createdById: userId },
      include: {
        exam: {
          include: {
            subject: true,
            professor: true,
            university: true,
            course: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async delete(id: string, userId: string) {
    // Verify ownership
    const shareLink = await prisma.shareLink.findFirst({
      where: { id, createdById: userId },
    });

    if (!shareLink) {
      throw new Error("Link non trovato o non autorizzato");
    }

    return prisma.shareLink.delete({
      where: { id },
    });
  },

  async findByExam(examId: string, userId: string) {
    return prisma.shareLink.findFirst({
      where: {
        examId,
        createdById: userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        exam: {
          include: {
            subject: true,
            professor: true,
          },
        },
      },
    });
  },

  async getProfessorsBySubject(subjectId: string) {
    return prisma.professor.findMany({
      where: {
        subjects: {
          some: {
            subjectId,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  },
};

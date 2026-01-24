import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type {
  CreateNotebookInput,
  UpdateNotebookInput,
  CreatePageInput,
  UpdatePageInput,
} from "@/lib/validations/notebook.schema";
import { NOTEBOOK_LIMITS } from "@/lib/validations/notebook.schema";

// Default empty ProseMirror document
const EMPTY_DOC: Prisma.InputJsonValue = { type: "doc", content: [{ type: "paragraph" }] };

// ============================================
// ERROR CLASSES
// ============================================

export class NotebookNotFoundError extends Error {
  constructor(id: string) {
    super(`Notebook not found: ${id}`);
    this.name = "NotebookNotFoundError";
  }
}

export class PageNotFoundError extends Error {
  constructor(id: string) {
    super(`Page not found: ${id}`);
    this.name = "PageNotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized access");
    this.name = "UnauthorizedError";
  }
}

export class VersionConflictError extends Error {
  constructor(expected: number, actual: number) {
    super(`Version conflict: expected ${expected}, got ${actual}`);
    this.name = "VersionConflictError";
  }
}

export class LimitExceededError extends Error {
  constructor(limit: string) {
    super(`Limit exceeded: ${limit}`);
    this.name = "LimitExceededError";
  }
}

export class LastPageError extends Error {
  constructor() {
    super("Cannot delete the last page of a notebook");
    this.name = "LastPageError";
  }
}

// ============================================
// TYPES
// ============================================

interface PaginationOptions {
  limit?: number;
  offset?: number;
  includeDeleted?: boolean;
}

// ============================================
// SERVICE
// ============================================

export const notebookService = {
  // ============================================
  // NOTEBOOK CRUD
  // ============================================

  /**
   * Find all notebooks for a user with pagination
   */
  async findAll(userId: string, options: PaginationOptions = {}) {
    const { limit = 50, offset = 0, includeDeleted = false } = options;

    const where: Prisma.NotebookWhereInput = {
      userId,
      ...(includeDeleted ? {} : { deletedAt: null }),
    };

    const [notebooks, total] = await Promise.all([
      prisma.notebook.findMany({
        where,
        include: {
          pages: {
            where: includeDeleted ? {} : { deletedAt: null },
            orderBy: { order: "asc" },
            take: 20, // Limit pages per notebook in list view
          },
          _count: {
            select: { pages: { where: includeDeleted ? {} : { deletedAt: null } } },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.notebook.count({ where }),
    ]);

    return {
      notebooks,
      total,
      hasMore: offset + notebooks.length < total,
    };
  },

  /**
   * Find a notebook by ID with ownership verification
   */
  async findById(id: string, userId: string, options: PaginationOptions = {}) {
    const { includeDeleted = false } = options;

    const notebook = await prisma.notebook.findFirst({
      where: {
        id,
        userId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        pages: {
          where: includeDeleted ? {} : { deletedAt: null },
          orderBy: { order: "asc" },
        },
        _count: {
          select: { pages: { where: includeDeleted ? {} : { deletedAt: null } } },
        },
      },
    });

    if (!notebook) {
      throw new NotebookNotFoundError(id);
    }

    return notebook;
  },

  /**
   * Create a new notebook with an initial page
   */
  async create(data: CreateNotebookInput, userId: string) {
    // Check notebook limit per user (optional)
    const existingCount = await prisma.notebook.count({
      where: { userId, deletedAt: null },
    });

    if (existingCount >= 1000) {
      throw new LimitExceededError("Maximum 1000 notebooks per user");
    }

    return prisma.notebook.create({
      data: {
        ...data,
        userId,
        pages: {
          create: {
            title: "Appunti Generali",
            content: EMPTY_DOC, // Empty ProseMirror doc
            contentHtml: "<p></p>",
            order: 0,
            wordCount: 0,
            characterCount: 0,
          },
        },
      },
      include: {
        pages: true,
        _count: { select: { pages: true } },
      },
    });
  },

  /**
   * Update a notebook with ownership verification (transactional)
   */
  async update(id: string, data: UpdateNotebookInput, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Verify ownership
      const notebook = await tx.notebook.findFirst({
        where: { id, userId, deletedAt: null },
      });

      if (!notebook) {
        throw new NotebookNotFoundError(id);
      }

      return tx.notebook.update({
        where: { id },
        data,
        include: {
          pages: {
            where: { deletedAt: null },
            orderBy: { order: "asc" },
          },
          _count: { select: { pages: { where: { deletedAt: null } } } },
        },
      });
    });
  },

  /**
   * Soft delete a notebook (transactional)
   */
  async delete(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Verify ownership
      const notebook = await tx.notebook.findFirst({
        where: { id, userId, deletedAt: null },
      });

      if (!notebook) {
        throw new NotebookNotFoundError(id);
      }

      const now = new Date();

      // Soft delete all pages
      await tx.notebookPage.updateMany({
        where: { notebookId: id, deletedAt: null },
        data: { deletedAt: now },
      });

      // Soft delete notebook
      return tx.notebook.update({
        where: { id },
        data: { deletedAt: now },
      });
    });
  },

  /**
   * Permanently delete a notebook (for admin/cleanup)
   */
  async permanentDelete(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const notebook = await tx.notebook.findFirst({
        where: { id, userId },
      });

      if (!notebook) {
        throw new NotebookNotFoundError(id);
      }

      // Cascade delete will handle pages
      return tx.notebook.delete({
        where: { id },
      });
    });
  },

  /**
   * Restore a soft-deleted notebook
   */
  async restore(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const notebook = await tx.notebook.findFirst({
        where: { id, userId, deletedAt: { not: null } },
      });

      if (!notebook) {
        throw new NotebookNotFoundError(id);
      }

      // Restore all pages
      await tx.notebookPage.updateMany({
        where: { notebookId: id },
        data: { deletedAt: null },
      });

      // Restore notebook
      return tx.notebook.update({
        where: { id },
        data: { deletedAt: null },
        include: {
          pages: { orderBy: { order: "asc" } },
          _count: { select: { pages: true } },
        },
      });
    });
  },

  // ============================================
  // PAGE CRUD
  // ============================================

  /**
   * Create a new page in a notebook
   */
  async createPage(notebookId: string, data: CreatePageInput, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Verify ownership and get page count
      const notebook = await tx.notebook.findFirst({
        where: { id: notebookId, userId, deletedAt: null },
        include: { _count: { select: { pages: { where: { deletedAt: null } } } } },
      });

      if (!notebook) {
        throw new NotebookNotFoundError(notebookId);
      }

      // Check page limit
      if (notebook._count.pages >= NOTEBOOK_LIMITS.MAX_PAGES_PER_NOTEBOOK) {
        throw new LimitExceededError(
          `Maximum ${NOTEBOOK_LIMITS.MAX_PAGES_PER_NOTEBOOK} pages per notebook`
        );
      }

      // Calculate order: find max order and add 1
      const maxOrderPage = await tx.notebookPage.findFirst({
        where: { notebookId, deletedAt: null },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const order = data.order ?? (maxOrderPage?.order ?? -1) + 1;

      return tx.notebookPage.create({
        data: {
          title: data.title,
          content: (data.content as Prisma.InputJsonValue) ?? EMPTY_DOC,
          contentHtml: data.contentHtml ?? "<p></p>",
          order,
          wordCount: data.wordCount ?? 0,
          characterCount: data.characterCount ?? 0,
          notebookId,
        },
      });
    });
  },

  /**
   * Update a page with optimistic locking
   */
  async updatePage(
    pageId: string,
    data: UpdatePageInput,
    userId: string,
    expectedVersion?: number
  ) {
    return prisma.$transaction(async (tx) => {
      // Verify ownership through notebook
      const page = await tx.notebookPage.findFirst({
        where: { id: pageId, deletedAt: null },
        include: { notebook: true },
      });

      if (!page) {
        throw new PageNotFoundError(pageId);
      }

      if (page.notebook.userId !== userId) {
        throw new UnauthorizedError();
      }

      if (page.notebook.deletedAt) {
        throw new NotebookNotFoundError(page.notebookId);
      }

      // Optimistic locking: check version
      if (expectedVersion !== undefined && page.version !== expectedVersion) {
        throw new VersionConflictError(expectedVersion, page.version);
      }

      // Prepare update data with version increment
      // Destructure content separately to handle type casting
      const { content, ...restData } = data;
      const updateData: Prisma.NotebookPageUpdateInput = {
        ...restData,
        ...(content !== undefined && { content: content as Prisma.InputJsonValue }),
        version: { increment: 1 },
      };

      return tx.notebookPage.update({
        where: { id: pageId },
        data: updateData,
      });
    });
  },

  /**
   * Soft delete a page
   */
  async deletePage(pageId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Verify ownership through notebook
      const page = await tx.notebookPage.findFirst({
        where: { id: pageId, deletedAt: null },
        include: {
          notebook: {
            include: { _count: { select: { pages: { where: { deletedAt: null } } } } },
          },
        },
      });

      if (!page) {
        throw new PageNotFoundError(pageId);
      }

      if (page.notebook.userId !== userId) {
        throw new UnauthorizedError();
      }

      // Cannot delete if it's the last page
      if (page.notebook._count.pages <= 1) {
        throw new LastPageError();
      }

      return tx.notebookPage.update({
        where: { id: pageId },
        data: { deletedAt: new Date() },
      });
    });
  },

  /**
   * Find a page by ID with ownership verification
   */
  async findPageById(pageId: string, userId: string, includeDeleted = false) {
    const page = await prisma.notebookPage.findFirst({
      where: {
        id: pageId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: { notebook: true },
    });

    if (!page) {
      throw new PageNotFoundError(pageId);
    }

    if (page.notebook.userId !== userId) {
      throw new UnauthorizedError();
    }

    return page;
  },

  /**
   * Restore a soft-deleted page
   */
  async restorePage(pageId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const page = await tx.notebookPage.findFirst({
        where: { id: pageId, deletedAt: { not: null } },
        include: { notebook: true },
      });

      if (!page) {
        throw new PageNotFoundError(pageId);
      }

      if (page.notebook.userId !== userId) {
        throw new UnauthorizedError();
      }

      return tx.notebookPage.update({
        where: { id: pageId },
        data: { deletedAt: null },
      });
    });
  },

  /**
   * Reorder pages in a notebook
   */
  async reorderPages(
    notebookId: string,
    pageOrders: { pageId: string; order: number }[],
    userId: string
  ) {
    return prisma.$transaction(async (tx) => {
      // Verify ownership
      const notebook = await tx.notebook.findFirst({
        where: { id: notebookId, userId, deletedAt: null },
      });

      if (!notebook) {
        throw new NotebookNotFoundError(notebookId);
      }

      // Update all page orders
      await Promise.all(
        pageOrders.map(({ pageId, order }) =>
          tx.notebookPage.update({
            where: { id: pageId },
            data: { order },
          })
        )
      );

      // Return updated notebook
      return tx.notebook.findFirst({
        where: { id: notebookId },
        include: {
          pages: {
            where: { deletedAt: null },
            orderBy: { order: "asc" },
          },
        },
      });
    });
  },
};

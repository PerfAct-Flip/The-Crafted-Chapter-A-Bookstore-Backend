import { prisma } from "../../lib/prisma";

export const toggleFavorite = async (userId: string, bookId: string) => {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.favorite.deleteMany({ where: { userId, bookId } });
    if (count > 0) return { favorited: false };

    const book = await tx.book.findFirst({ where: { id: bookId, deletedAt: null } });
    if (!book) return null;

    await tx.favorite.create({ data: { userId, bookId } });
    return { favorited: true };
  });
};

export const getFavorites = async (userId: string) => {
  return prisma.favorite.findMany({
    where: { userId, book: { deletedAt: null } },
    include: { book: true },
    orderBy: { createdAt: "desc" },
  });
};


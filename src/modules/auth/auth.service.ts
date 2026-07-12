import { prisma } from "../../lib/prisma";
import type { User, RefreshToken } from "../../../generated/prisma/client";

export const ACCESS_TOKEN_COOKIE = 'portalAccessToken';
export const REFRESH_TOKEN_COOKIE = 'portalRefreshToken';
export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;          // 15 minutes
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─────────────────────────────────────────────
// Auth 
// ─────────────────────────────────────────────

export const createUser = async (userData: any): Promise<User | null> => {
    const { name, username, email, passwordHash, avatarUrl } = userData;
    const user = await prisma.user.create({
        data: {
            name,
            username,
            email,
            passwordHash,
            avatarUrl: avatarUrl || null,

        },
    });
    return user;
};

export const findForAuth = async (identifier: string): Promise<User | null> => {
    return prisma.user.findFirst({
        where: {
            OR: [{ username: identifier }, { email: identifier }],
        },
    });
};

export const findById = async (id: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { id }
  });
  return user;
};

// ─────────────────────────────────────────────
// Token
// ─────────────────────────────────────────────


export const storeRefreshToken = async (
  userId: string,
  token: string,
  expiresAt: Date
): Promise<void> => {
  await prisma.refreshToken.create({ data: { userId, token, expiresAt } });
};

export const findValidRefreshToken = async (token: string): Promise<RefreshToken | null> => {
  return prisma.refreshToken.findUnique({
    where: { token },
  });
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.update({
    where: { token },
    data: { revoked: true },
  });
};

export const revokeAllUserRefreshTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
};

const CLEANUP_GRACE_DAYS = 15;

export const cleanupExpiredTokens = async (): Promise<void> => {
  const cutoff = new Date(Date.now() - CLEANUP_GRACE_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: cutoff } },
        { revoked: true, createdAt: { lt: cutoff } },
      ],
    },
  });
};

export const refreshTokens = async (id : string, newRefreshToken :string, refreshToken: string) =>{
     // Rotate atomically: create new token and revoke old in a single transaction
    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.create({
        data: {
          userId: id,
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        },
      });
      await tx.refreshToken.update({
        where: { token: refreshToken },
        data: { revoked: true },
      });
    });
}
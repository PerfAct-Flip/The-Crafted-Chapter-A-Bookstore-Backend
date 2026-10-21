import { createHash, randomBytes } from "crypto";
import { prisma } from "../../lib/prisma";
import type { User, RefreshToken } from "../../../generated/prisma/client";
import { Prisma } from "../../../generated/prisma/client";

export const ACCESS_TOKEN_COOKIE = "portalAccessToken";
export const REFRESH_TOKEN_COOKIE = "portalRefreshToken";
export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type SafeUser = Omit<User, "passwordHash">;

export class DuplicateUserError extends Error {
  constructor() {
    super("A user with this email or username already exists");
    this.name = "DuplicateUserError";
  }
}

export type CreateUserInput = {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string | null;
};

const stripPassword = (user: User): SafeUser => {
  const { passwordHash, ...safe } = user;
  return safe;
};

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

// `role` is intentionally not accepted here: new users always get the schema default (USER).
export const createUser = async (input: CreateUserInput): Promise<SafeUser> => {
  const { name, username, email, passwordHash, avatarUrl } = input;
  try {
    const user = await prisma.user.create({
      data: {
        name,
        username: username.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        avatarUrl: avatarUrl || null,
      },
    });
    return stripPassword(user);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new DuplicateUserError(); // map to 409 in the controller
    }
    throw e;
  }
};

// Returns the full user (including passwordHash) because login needs it to compare passwords.
// Never send this object to the client or attach it to req.user.
export const findForAuth = async (identifier: string): Promise<User | null> => {
  const value = identifier.trim();
  return prisma.user.findFirst({
    where: {
      OR: [{ username: value }, { email: value.toLowerCase() }],
    },
  });
};

export const findById = async (id: string): Promise<SafeUser | null> => {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? stripPassword(user) : null;
};

// ─────────────────────────────────────────────
// Refresh tokens
// Only a SHA-256 hash is stored in the database. The raw token exists only in the cookie.
// ─────────────────────────────────────────────

const generateRawToken = () => randomBytes(48).toString("base64url");
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export type IssuedRefreshToken = { token: string; expiresAt: Date };

// Use at login. Put `token` in the cookie.
export const createRefreshToken = async (userId: string): Promise<IssuedRefreshToken> => {
  const token = generateRawToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await prisma.refreshToken.create({
    data: { userId, token: hashToken(token), expiresAt },
  });
  return { token, expiresAt };
};

export const findValidRefreshToken = async (token: string): Promise<RefreshToken | null> => {
  return prisma.refreshToken.findFirst({
    where: { token: hashToken(token), revoked: false, expiresAt: { gt: new Date() } },
  });
};

// Safe to call with an unknown or already-revoked token (logout with a stale cookie).
export const revokeRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { token: hashToken(token) },
    data: { revoked: true },
  });
};

export const revokeAllUserRefreshTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
};

export type RotateResult =
  | { ok: true; userId: string; token: string; expiresAt: Date }
  | { ok: false; reused: boolean };

// Atomically revokes the old token and issues a new one.
// The `revoked: false` condition makes the revoke the gatekeeper, so two concurrent
// refreshes with the same token cannot both succeed.
// If a token that was already revoked is presented again, it is treated as theft:
// every session for that user is revoked and the caller should respond 401.
export const rotateRefreshToken = async (oldToken: string): Promise<RotateResult> => {
  const oldHash = hashToken(oldToken);

  const existing = await prisma.refreshToken.findUnique({ where: { token: oldHash } });
  if (!existing) return { ok: false, reused: false };

  const newToken = generateRawToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  const rotated = await prisma.$transaction(async (tx) => {
    const { count } = await tx.refreshToken.updateMany({
      where: { token: oldHash, revoked: false, expiresAt: { gt: new Date() } },
      data: { revoked: true },
    });
    if (count === 0) return false;

    await tx.refreshToken.create({
      data: { userId: existing.userId, token: hashToken(newToken), expiresAt },
    });
    return true;
  });

  if (!rotated) {
    const reused = existing.revoked;
    if (reused) await revokeAllUserRefreshTokens(existing.userId);
    return { ok: false, reused };
  }

  return { ok: true, userId: existing.userId, token: newToken, expiresAt };
};

// ─────────────────────────────────────────────
// Cleanup (call from a cron job or on a timer at startup)
// ─────────────────────────────────────────────

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
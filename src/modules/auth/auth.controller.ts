import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../../config/env";
import type { Role } from "../../../generated/prisma/client";
import type { LoginInput, RegisterInput } from "../../schemas/index";
import { success, error } from "../../utils/response";
import {
  createUser,
  findForAuth,
  findById,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  cleanupExpiredTokens,
  DuplicateUserError,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_MS,
} from "./auth.service";
import type { AuthenticatedRequest } from "../../types/common";

interface JwtPayload {
  id: string;
  username: string;
  role: Role;
}

// The access token is a JWT. The refresh token is an opaque random string
// (generated and hashed in auth.service), so it is no longer signed with jwtRefreshSecret.
function issueAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.security.jwtSecret, { expiresIn: "15m" });
}

const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

function setAccessCookie(res: Response, token: string): void {
  res.cookie(ACCESS_TOKEN_COOKIE, token, { ...cookieBase, maxAge: ACCESS_TOKEN_TTL_MS });
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, { ...cookieBase, maxAge: REFRESH_TOKEN_TTL_MS });
}

function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, cookieBase);
  res.clearCookie(REFRESH_TOKEN_COOKIE, cookieBase);
}

export const register = async (
  req: Request<{}, any, RegisterInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, email, name, password } = req.body;
    const passwordHash = await bcrypt.hash(password, env.security.bcryptRounds);
    const newUser = await createUser({ name, username, email, passwordHash });
    return success(res, newUser, {}, 201);
  } catch (e) {
    if (e instanceof DuplicateUserError) {
      return error(res, "USER_EXISTS", "Username or email already taken", {}, 409);
    }
    next(e);
  }
};

export const login = async (
  req: Request<{}, any, LoginInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password } = req.body;
    const user = await findForAuth(username);

    // Same message for "no such user" and "wrong password" so the API
    // doesn't reveal which usernames or emails exist.
    const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !isValid) {
      console.warn("Login failed", { username });
      return error(res, "INVALID_CREDENTIALS", "Invalid username or password", {}, 401);
    }

    const accessToken = issueAccessToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });
    const refresh = await createRefreshToken(user.id);

    // Fire-and-forget: delete tokens expired/revoked for more than 15 days
    cleanupExpiredTokens().catch(() => {});

    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refresh.token);

    console.log("Login success", { userId: user.id });
    return success(
      res,
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        accessToken,
      },
      {},
      200,
    );
  } catch (e) {
    next(e);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    clearAuthCookies(res);
    return success(res, { message: "Logged out successfully" });
  } catch (e) {
    next(e);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const oldToken = req.cookies[REFRESH_TOKEN_COOKIE];
    if (!oldToken) {
      return error(res, "NO_REFRESH_TOKEN", "No refresh token provided", {}, 401);
    }

    // Revokes the old token and issues a new one in a single transaction.
    // If an already-used token is replayed, the service revokes all of that user's sessions.
    const result = await rotateRefreshToken(oldToken);
    if (!result.ok) {
      clearAuthCookies(res);
      return error(
        res,
        "INVALID_REFRESH_TOKEN",
        "Refresh token is invalid, expired or already used",
        {},
        401,
      );
    }

    // Reload the user so the new access token carries their current role.
    const user = await findById(result.userId);
    if (!user) {
      clearAuthCookies(res);
      return error(res, "USER_NOT_FOUND", "User not found", {}, 401);
    }

    const accessToken = issueAccessToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    setAccessCookie(res, accessToken);
    setRefreshCookie(res, result.token);

    console.log("Token refreshed", { userId: user.id });
    return success(res, { ok: true });
  } catch (e) {
    next(e);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.user?.id;
    if (!id) {
      return error(res, "UNAUTHORIZED", "Not authenticated", {}, 401);
    }
    const user = await findById(id);
    if (!user) {
      return error(res, "USER_NOT_FOUND", "User not found", {}, 401);
    }
    return success(res, user);
  } catch (e) {
    next(e);
  }
};
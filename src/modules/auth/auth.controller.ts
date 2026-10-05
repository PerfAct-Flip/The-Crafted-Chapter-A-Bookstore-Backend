import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import env from "../../config/env";
import type { LoginInput, RegisterInput } from "../../schemas/index"
import { success, error } from '../../utils/response';
import { createUser, findForAuth, findById, storeRefreshToken, cleanupExpiredTokens, revokeRefreshToken, findValidRefreshToken } from "./auth.service";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, ACCESS_TOKEN_TTL_MS, REFRESH_TOKEN_TTL_MS } from "./auth.service";
import type { AuthenticatedRequest} from "../../types/common";

interface JwtPayload {
  id: string,
  username: string,

}


function issueAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.security.jwtSecret, { expiresIn: '15m' });
}

function issueRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.security.jwtRefreshSecret, { expiresIn: '7d' });
}

function setAccessCookie(res: Response, token: string): void {
  res.cookie(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_TTL_MS,
  });
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_TTL_MS,
  });
}

function clearAuthCookies(res: Response): void {
  const opts = { httpOnly: true, secure: true, sameSite: 'lax' as const };
  res.clearCookie(ACCESS_TOKEN_COOKIE, opts);
  res.clearCookie(REFRESH_TOKEN_COOKIE, opts);
}

export const register = async (
  req: Request<{}, any, RegisterInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, name, password } = req.body;
    const passwordHash = await bcrypt.hash(password, env.security.bcryptRounds);
    const newUser = await createUser({ name, username, email, passwordHash });
    return success(res, newUser, {}, 201);

  } catch (e: any) {
    if (e?.code === 'P2002') {
      return error(res, 'USER_EXISTS', 'Username or email already taken', {}, 400);
    }
    next(e);
  }

}

export const login = async (
  req: Request<{}, any, LoginInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password} = req.body;
    const user = await findForAuth(username);
    if (!user) {
      console.warn({ username }, 'Login failed: user not found');
      return error(res, 'USER_NOT_FOUND', 'Username or email not found', {}, 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      console.warn({ username }, 'Login failed: invalid password');
      return error(res, 'INVALID_PASSWORD', 'Incorrect password', {}, 401);
    }

    const jwtPayload : JwtPayload = { id : user.id, username : user.username};

    const accessToken = issueAccessToken(jwtPayload);
    const refreshToken = issueRefreshToken(jwtPayload);

    await storeRefreshToken(user.id, refreshToken, new Date(Date.now() + REFRESH_TOKEN_TTL_MS));

    // Fire-and-forget: delete tokens expired/revoked for more than 15 days
    cleanupExpiredTokens().catch(() => {});

    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    console.log({ userId: user.id, username: user.username }, 'Login success');
    return success(res, {
      id: user.id,
      username : user.username,
      email: user.email,
      accessToken,
      // refreshToken
    }, {}, 200);

  } catch (e : any) {
    next(e);
  }
}

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
    if (refreshToken) {
      await revokeRefreshToken(refreshToken).catch(() => {});
    }
    clearAuthCookies(res);
    return success(res, { message: 'Logged out successfully' });
  } catch (e) {
    next(e);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      return error(res, 'NO_REFRESH_TOKEN', 'No refresh token provided', {}, 401);
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, env.security.jwtRefreshSecret) as JwtPayload;
    } catch {
      return error(res, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token', {}, 401);
    }

    const stored = await findValidRefreshToken(refreshToken);
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      clearAuthCookies(res);
      return error(res, 'REFRESH_TOKEN_REVOKED', 'Refresh token has been revoked or expired', {}, 401);
    }

    const jwtPayload: JwtPayload = {
      id: decoded.id,
      username: decoded.username
    };

    const newAccessToken = issueAccessToken(jwtPayload);
    const newRefreshToken = issueRefreshToken(jwtPayload);

    await refreshToken(decoded.id, newRefreshToken, refreshToken);

    setAccessCookie(res, newAccessToken);
    setRefreshCookie(res, newRefreshToken);

    console.log({ userId: decoded.id }, 'Token refreshed');
    return success(res, { ok: true });

  } catch (e) {
    next(e);
  }
};


export const me = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.user?.id;
    if (!id) {
      return error(res, 'UNAUTHORIZED', 'Not authenticated', {}, 401);
    }
    const user = await findById(id);
    if (!user) {
      return error(res, 'USER_NOT_FOUND', 'User not found', {}, 401);
    }
    return success(res, user);
  } catch (e) {
    next(e);
  }
};

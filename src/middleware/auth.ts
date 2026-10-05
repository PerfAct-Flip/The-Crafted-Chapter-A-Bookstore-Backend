import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type {
  AuthenticatedRequest,
  AuthUser,
  CustomJwtPayload,
} from "../types/common";
import env from "../config/env";
import { error } from "node:console";

// export interface AuthRequest extends Request {
//   user?: { id: string };
// }
export const requireBearerToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  // const authHeader = req.headers.authorization as string | undefined;
  const authHeader = req.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return next();
  }
  const secret = env.security.jwtSecret;
  if (!secret) {
    console.error("FATAL: JWT_SECRET is missing in environment variables.");
    return error(res, "SERVER_ERROR", "Internal server error", {}, 500);
  }
  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "object" && decoded !== null && "id" in decoded) {
      const payload = decoded as CustomJwtPayload;

      req.user = {
        id: payload.id,
        username: payload.username,
      };

      return next();
    }
    return error(res, "INVALID_TOKEN", "Token payload is malformed", {}, 401);
  } catch (err) {
    return error(res, "INVALID_TOKEN", "Invalid or Expired Token", {}, 401);
  }
};

export const requireCookieToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user) {
    return next();
  }
  const token = req.cookies?.accessToken;
  if (!token) {
    return error(
      res,
      "UNAUTHORIZED",
      "Authentication required. No session cookie or Bearer token found.",
      {},
      401,
    );
  }

  const secret = env.security.jwtSecret;
  if (!secret) {
    console.error("FATAL: JWT_SECRET is missing in environment variables.");
    return error(res, "SERVER_ERROR", "Internal server error", {}, 500);
  }

  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "object" && decoded !== null && "id" in decoded) {
      const payload = decoded as CustomJwtPayload;

      req.user = {
        id: payload.id,
        username: payload.username,
      };

      return next();
    }
    return error(res, "INVALID_COOKIE", "Cookie payload is malformed", {}, 401);
  } catch (err) {
    return error(
      res,
      "INVALID_COOKIE",
      "Invalid or expired session cookie",
      {},
      401,
    );
  }
};
export const protect = [requireBearerToken, requireCookieToken];

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const portalAccessToken = req.cookies.portalAccessToken;

    if (!portalAccessToken) {
      console.warn(
        { url: req.url },
        "Auth rejected: no portal access token provided",
      );
      return res
        .status(401)
        .json({ success: false, error: "No portal access token provided" });
    }
    const decoded = jwt.verify(
      portalAccessToken,
      env.security.jwtSecret,
    ) as AuthUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    console.warn(
      { url: req.url, err: err.message },
      "Auth rejected: invalid portal access token",
    );
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
};

export default authenticate;

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthenticatedRequest, AuthUser } from "../types/common";
import env from "../config/env";


export interface AuthRequest extends Request {
  user?: { id: string };
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    req.user = { id: decoded.id };
    next();
  } catch {
    res.status(401).json({ message: "Token invalid" });
  }
};

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const portalAccessToken = req.cookies.portalAccessToken;

    if (!portalAccessToken) {
      console.warn({ url: req.url }, 'Auth rejected: no portal access token provided');
      return res.status(401).json({ success: false, error: 'No portal access token provided' });
    }
    const decoded = jwt.verify(portalAccessToken, env.security.jwtSecret) as AuthUser;
    req.user = decoded;
    next();

  } catch (err: any) {
    console.warn({ url: req.url, err: err.message }, 'Auth rejected: invalid portal access token');
    res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}

export default authenticate;
import type { Request } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
export interface AuthUser {
  id: string;
  email?: string;
  username: string;
  name?: string;
}

export interface CustomJwtPayload extends JwtPayload{
  id : string;
  username: string;
}
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
export interface ApiError extends Error {
  status?: number;
  errors?: any[];
}

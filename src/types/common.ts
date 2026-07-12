import type { Request } from 'express';

export interface AuthUser {
  id: string;
  email?: string;
  username: string;
  name?: string;
}
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
export interface ApiError extends Error {
  status?: number;
  errors?: any[];
}

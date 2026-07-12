import { z } from "zod";


/**
 * Authentication Schemas
 */
export const loginSchema = z.object({
  body: z.object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be between 3 and 100 characters')
      .max(100, 'Username must be between 3 and 100 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be between 3 and 100 characters')
      .max(100, 'Username must be between 3 and 100 characters')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Username can only contain letters, numbers, underscores, and hyphens'
      ),
    email: z
      .email('Invalid email address')
      .max(255, 'Email must not exceed 255 characters'),
    // Stored as User.name (VarChar 255) — not split into first/last
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(255, 'Name must not exceed 255 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain lowercase, uppercase, and numeric characters'
      ),
  }),
});


// ─────────────────────────────────────────────
// INFERRED TYPES (use in controllers for type safety)
// ─────────────────────────────────────────────

export type LoginInput           = z.infer<typeof loginSchema>['body'];
export type RegisterInput        = z.infer<typeof registerSchema>['body'];
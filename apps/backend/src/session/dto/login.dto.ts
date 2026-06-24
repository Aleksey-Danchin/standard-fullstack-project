/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import { z } from 'zod';

export const loginDtoSchema = z.object({
  login: z.string().trim().min(1, 'Login is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof loginDtoSchema>;

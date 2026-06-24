/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  concurrency: Number(import.meta.env.VITE_API_CONCURRENCY ?? 5),
} as const;

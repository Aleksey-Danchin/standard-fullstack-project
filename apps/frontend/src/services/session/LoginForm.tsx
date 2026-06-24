/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import { type FormEvent, useState } from 'react';
import { loginDtoSchema } from '__backend/src/session/dto/login.dto';
import { useSessionUser } from './useSessionUser';

export function LoginForm() {
  const { login } = useSessionUser();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = loginDtoSchema.safeParse({ login: loginValue, password });
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message ?? 'Invalid form data';
      setError(firstIssue);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(parsed.data);
    } catch {
      setError('Login failed. Check credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex w-full max-w-sm flex-col gap-3" onSubmit={handleSubmit}>
      <label className="form-control w-full">
        <span className="label-text">Login</span>
        <input
          className="input input-bordered w-full"
          name="login"
          autoComplete="username"
          value={loginValue}
          onChange={(event) => setLoginValue(event.target.value)}
        />
      </label>

      <label className="form-control w-full">
        <span className="label-text">Password</span>
        <input
          className="input input-bordered w-full"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {error && (
        <p className="text-error text-sm" role="alert">
          {error}
        </p>
      )}

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import { signIn, signUp } from '@/app/actions/auth';
import { generateNicknameSuggestions } from '@/lib/services/nickname';
import { Eye, EyeOff, Zap } from 'lucide-react';

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full py-3 text-base">
      {pending ? 'Loading…' : label}
    </button>
  );
}

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const action = mode === 'login' ? signIn : signUp;
  const [state, formAction] = useFormState(action, null);

  const [email, setEmail] = useState('');
  const [showPass, setShowPass] = useState(false);
  const suggestions = generateNicknameSuggestions(email);

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/20">
          <Zap size={28} className="text-danger" />
        </div>
        <h1 className="text-3xl font-black">
          {mode === 'login' ? 'Welcome back' : 'Join the Arena'}
        </h1>
        <p className="mt-2 text-sm text-silver">
          {mode === 'login'
            ? 'Sign in to your prediction account.'
            : 'Create your Supersports World Cup 2026 profile.'}
        </p>
      </div>

      <form action={formAction} className="card space-y-4">
        {state?.error && (
          <div className="rounded-xl bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
            {state.error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-silver">Email</label>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="input"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-silver">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPass ? 'text' : 'password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="input pr-11"
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-silver hover:text-white"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {mode === 'register' && (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-silver">Display Name</label>
              <input
                name="display_name"
                type="text"
                className="input"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-silver">
                Nickname <span className="text-silver/60">(shown on leaderboard)</span>
              </label>
              <input
                name="nickname"
                type="text"
                className="input"
                placeholder="e.g. ThunderMaestro"
                required
              />
              {email && (
                <p className="mt-1.5 text-xs text-silver">
                  Suggestions:{' '}
                  {suggestions.map((s, i) => (
                    <span key={i} className="text-danger cursor-pointer hover:underline mx-1">
                      {s}
                    </span>
                  ))}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-silver">
                Favourite Team <span className="text-silver/60">(optional)</span>
              </label>
              <input
                name="favorite_team"
                type="text"
                className="input"
                placeholder="e.g. Thailand, Brazil…"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-silver">
                Football Alias <span className="text-silver/60">(optional)</span>
              </label>
              <input
                name="football_alias"
                type="text"
                className="input"
                placeholder="e.g. The Maestro, El Capitán…"
              />
            </div>
          </>
        )}

        <SubmitBtn label={mode === 'login' ? 'Sign In' : 'Create Account'} />

        <p className="text-center text-sm text-silver">
          {mode === 'login' ? (
            <>
              No account?{' '}
              <a href="/register" className="text-danger hover:underline font-medium">
                Register here
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a href="/login" className="text-danger hover:underline font-medium">
                Sign in
              </a>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

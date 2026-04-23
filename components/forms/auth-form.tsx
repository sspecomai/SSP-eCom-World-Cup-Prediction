'use client';

import { useState } from 'react';
import { generateNicknameSuggestions } from '@/lib/services/nickname';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [email, setEmail] = useState('');
  const suggestions = generateNicknameSuggestions(email);

  return (
    <form className="card mx-auto max-w-lg space-y-3">
      <h1 className="text-2xl font-black">{mode === 'login' ? 'Login' : 'Register'} your squad account</h1>
      <input className="w-full rounded-xl border border-white/15 bg-black/20 p-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded-xl border border-white/15 bg-black/20 p-3" placeholder="Password" type="password" />
      {mode === 'register' && (
        <>
          <input className="w-full rounded-xl border border-white/15 bg-black/20 p-3" placeholder="Display name" />
          <input className="w-full rounded-xl border border-white/15 bg-black/20 p-3" placeholder="Nickname" />
          <div className="rounded-xl border border-dashed border-white/20 p-3 text-sm">
            Nickname ideas: {suggestions.join(', ')}
          </div>
          <input className="w-full rounded-xl border border-white/15 bg-black/20 p-3" placeholder="Favorite team" />
        </>
      )}
      <button className="w-full rounded-xl bg-danger py-3 font-bold">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
    </form>
  );
}

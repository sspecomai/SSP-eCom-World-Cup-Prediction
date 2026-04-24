'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateProfile } from '@/app/actions/auth';
import { FOOTBALL_ALIASES } from '@/lib/services/nickname';
import type { Profile } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? 'Saving…' : 'Save Profile'}
    </button>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useFormState(updateProfile, null);

  return (
    <form action={action} className="card space-y-5">
      {state !== null && !state?.error && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-400">
          <CheckCircle size={16} />
          Profile saved successfully!
        </div>
      )}
      {state?.error && (
        <div className="rounded-xl bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-silver">Display Name</label>
          <input
            name="display_name"
            type="text"
            defaultValue={profile.display_name}
            className="input"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-silver">Nickname</label>
          <input
            name="nickname"
            type="text"
            defaultValue={profile.nickname}
            className="input"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-silver">Favourite Team</label>
        <input
          name="favorite_team"
          type="text"
          defaultValue={profile.favorite_team ?? ''}
          placeholder="e.g. Thailand, Brazil…"
          className="input"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-silver">Football Alias</label>
        <input
          name="football_alias"
          type="text"
          defaultValue={profile.football_alias ?? ''}
          placeholder="e.g. The Maestro"
          className="input"
        />
        <p className="mt-1.5 text-xs text-silver">
          Popular aliases:{' '}
          {FOOTBALL_ALIASES.slice(0, 5).map((alias, i) => (
            <span key={i} className="text-danger mx-1">{alias}</span>
          ))}
        </p>
      </div>

      <SubmitBtn />
    </form>
  );
}

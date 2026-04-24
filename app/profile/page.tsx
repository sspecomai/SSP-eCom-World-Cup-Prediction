import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/forms/profile-form';
import type { Profile } from '@/lib/types';

export const metadata = { title: 'My Profile · SSP WC2026 Predictor' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-black">My Profile</h1>
        <p className="mt-1 text-silver">Update your football identity and display details.</p>
      </div>

      <div className="card space-y-2">
        <p className="text-xs text-silver uppercase tracking-wider font-semibold">Account</p>
        <p className="text-sm">{user.email}</p>
      </div>

      <ProfileForm profile={profile as Profile} />
    </div>
  );
}

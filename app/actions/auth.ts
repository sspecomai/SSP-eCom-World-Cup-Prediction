'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type ActionResult = { error: string } | null;

export async function signUp(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const displayName = (formData.get('display_name') as string) || '';
  const nickname = (formData.get('nickname') as string) || '';
  const favoriteTeam = (formData.get('favorite_team') as string) || null;
  const footballAlias = (formData.get('football_alias') as string) || null;

  if (!email || !password || !displayName || !nickname) {
    return { error: 'All fields are required.' };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        nickname,
        favorite_team: favoriteTeam,
        football_alias: footballAlias,
      },
    },
  });

  if (error) return { error: error.message };

  revalidatePath('/');
  redirect('/dashboard');
}

export async function signIn(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) return { error: 'Email and password required.' };

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  revalidatePath('/');
  redirect('/dashboard');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/');
  redirect('/');
}

export async function updateProfile(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated.' };

  const displayName = formData.get('display_name') as string;
  const nickname = formData.get('nickname') as string;
  const favoriteTeam = formData.get('favorite_team') as string;
  const footballAlias = formData.get('football_alias') as string;

  if (!displayName || !nickname) return { error: 'Display name and nickname are required.' };

  const { error } = await supabase
    .from('users')
    .update({
      display_name: displayName,
      nickname,
      favorite_team: favoriteTeam || null,
      football_alias: footballAlias || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/profile');
  revalidatePath('/dashboard');
  return null;
}

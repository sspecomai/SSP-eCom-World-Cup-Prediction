import { createClient } from '@/lib/supabase/server';
import { setUserRole } from '@/app/actions/admin';
import { formatBangkokTime } from '@/lib/utils/time';
import { Users, Shield, User } from 'lucide-react';

export const metadata = { title: 'Admin: Users · SSP WC2026 Predictor' };

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from('users')
    .select(`
      id, display_name, nickname, favorite_team, football_alias,
      created_at,
      roles(role)
    `)
    .order('created_at', { ascending: false });

  const usersWithRole = (users ?? []).map((u) => ({
    ...u,
    role: (u.roles as { role: string } | null)?.role ?? 'user',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-black">Users</h2>
        <span className="badge-silver">{usersWithRole.length}</span>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-white/10">
              {['Display Name', 'Nickname', 'Favourite Team', 'Role', 'Joined', 'Actions'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-silver/70"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {usersWithRole.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-silver">
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  No users yet.
                </td>
              </tr>
            ) : (
              usersWithRole.map((u) => (
                <tr key={u.id} className="table-row-hover">
                  <td className="px-4 py-3 font-semibold">{u.display_name}</td>
                  <td className="px-4 py-3 text-silver">{u.nickname}</td>
                  <td className="px-4 py-3 text-silver">{u.favorite_team ?? '—'}</td>
                  <td className="px-4 py-3">
                    {u.role === 'admin' ? (
                      <span className="badge-danger flex items-center gap-1 w-fit">
                        <Shield size={11} /> Admin
                      </span>
                    ) : (
                      <span className="badge-silver flex items-center gap-1 w-fit">
                        <User size={11} /> User
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-silver">
                    {formatBangkokTime(u.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <form
                      action={async () => {
                        'use server';
                        await setUserRole(
                          u.id,
                          u.role === 'admin' ? 'user' : 'admin'
                        );
                      }}
                    >
                      <button
                        type="submit"
                        className="text-xs text-silver hover:text-white underline"
                      >
                        {u.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { formatDateLabel } from '../../lib/youtube'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import ConfirmDangerousAction from '../../components/ConfirmDangerousAction'
import { useAuthStore } from '../../store/authStore'

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'student' | 'teacher' | 'parent' | 'admin'
  phone: string | null
  isVerified: boolean
  hasPassword: boolean
  hasGoogle: boolean
  createdAt: string
}

type Action =
  | { type: 'promote'; user: AdminUser }
  | { type: 'demote'; user: AdminUser }
  | { type: 'delete'; user: AdminUser }

const PANEL = 'rounded-xl border border-slate-200 bg-white p-4'

export default function AdminUsersPage() {
  const { user: me } = useAuthStore()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [pendingAction, setPendingAction] = useState<Action | null>(null)

  async function refresh(searchTerm?: string) {
    setLoading(true)
    try {
      const response = await api.get('/admin/users', { params: searchTerm ? { search: searchTerm } : {} })
      setUsers(response.data.data.users ?? [])
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  useEffect(() => {
    const handle = setTimeout(() => {
      void refresh(search.trim() || undefined)
    }, 300)
    return () => clearTimeout(handle)
  }, [search])

  async function performAction() {
    if (!pendingAction) return
    const { type, user } = pendingAction
    try {
      if (type === 'delete') {
        await api.delete(`/admin/users/${user.id}`)
        setMessage(`${user.email} dihapus.`)
      } else {
        const role = type === 'promote' ? 'admin' : 'parent'
        await api.put(`/admin/users/${user.id}/role`, { role })
        setMessage(`${user.email} → ${role}.`)
      }
      await refresh(search.trim() || undefined)
    } catch (error: unknown) {
      setMessage(extractErr(error, 'Aksi gagal.'))
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Admin · Users"
        title="Kelola user QUPU"
        description="Promosikan akun jadi admin atau hapus akun. Hapus akun = hapus semua data anak + progres."
      />

      {message && (
        <div className={`rounded-lg px-3 py-2 text-sm ${message.toLowerCase().includes('gagal') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {message}
        </div>
      )}

      <div className={PANEL}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.16em] text-slate-700">{users.length} users</h2>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari email atau nama..."
              className="w-full rounded-md border border-slate-300 bg-white px-9 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
            />
          </div>
        </div>

        {loading ? (
          <p className="mt-3 text-sm text-slate-500">Memuat...</p>
        ) : users.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Tidak ada user yang cocok.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  <th className="py-2 pr-3">User</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Auth</th>
                  <th className="py-2 pr-3">Daftar</th>
                  <th className="py-2 pr-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isSelf = user.id === me?.id
                  return (
                    <tr key={user.id}>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{user.name}</span>
                          {isSelf && (
                            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-700">Kamu</span>
                          )}
                        </div>
                        <div className="truncate text-[11px] text-slate-500">{user.email}{user.phone ? ` · ${user.phone}` : ''}</div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="flex flex-wrap gap-1">
                          {user.hasGoogle && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700"><i className="fa-brands fa-google mr-0.5" aria-hidden="true" />Google</span>
                          )}
                          {user.hasPassword && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700"><i className="fa-solid fa-key mr-0.5" aria-hidden="true" />Password</span>
                          )}
                          {!user.hasGoogle && !user.hasPassword && (
                            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">No auth</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-[11px] text-slate-500">{formatDateLabel(user.createdAt)}</td>
                      <td className="py-2.5 pr-3">
                        <div className="flex justify-end gap-1.5">
                          {user.role === 'admin' ? (
                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() => setPendingAction({ type: 'demote', user })}
                              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Demote
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPendingAction({ type: 'promote', user })}
                              className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-slate-800"
                            >
                              Promote
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => setPendingAction({ type: 'delete', user })}
                            className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDangerousAction
        open={!!pendingAction}
        title={pendingAction ? pendingActionTitle(pendingAction) : ''}
        description={pendingAction ? pendingActionDescription(pendingAction) : ''}
        requiredText={pendingAction?.user.email ?? ''}
        confirmLabel={pendingAction ? pendingActionLabel(pendingAction) : ''}
        variant={pendingAction?.type === 'delete' ? 'danger' : 'warn'}
        onConfirm={performAction}
        onClose={() => setPendingAction(null)}
      />
    </div>
  )
}

function pendingActionTitle(action: Action): string {
  switch (action.type) {
    case 'promote':
      return `Promote ${action.user.name} jadi admin?`
    case 'demote':
      return `Demote ${action.user.name} jadi parent?`
    case 'delete':
      return `Hapus akun ${action.user.name}?`
  }
}

function pendingActionDescription(action: Action): string {
  switch (action.type) {
    case 'promote':
      return `Akun ini akan punya akses penuh ke semua admin panel. Pastikan kamu yakin.`
    case 'demote':
      return `Akses admin akan dicabut. Akun masih bisa login sebagai parent biasa.`
    case 'delete':
      return `Tindakan ini permanen. Semua data anak, skor, dan badge akun ini ikut terhapus.`
  }
}

function pendingActionLabel(action: Action): string {
  switch (action.type) {
    case 'promote':
      return 'Promote → admin'
    case 'demote':
      return 'Demote → parent'
    case 'delete':
      return 'Hapus permanen'
  }
}

function extractErr(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
  ) {
    return (error as { response: { data: { error: string } } }).response.data.error
  }
  return fallback
}

import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { formatDateLabel } from '../../lib/youtube'
import { getApiErrorMessage } from '../../lib/apiError'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import ConfirmDangerousAction from '../../components/ConfirmDangerousAction'
import { useToast } from '../../components/admin/Toast'
import { Button, EmptyState, Panel, SectionHeading, Skeleton, Tag } from '../../components/admin/ui'
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

export default function AdminUsersPage() {
  const toast = useToast()
  const { user: me } = useAuthStore()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
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
        toast.success(`${user.email} dihapus.`)
      } else {
        const role = type === 'promote' ? 'admin' : 'parent'
        await api.put(`/admin/users/${user.id}/role`, { role })
        toast.success(`${user.email} → ${role}.`)
      }
      await refresh(search.trim() || undefined)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Aksi gagal.'))
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

      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeading>{users.length} users</SectionHeading>
          <div className="relative w-full sm:max-w-xs">
            <i
              className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-admin-faint"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari email atau nama..."
              className="w-full rounded-lg border border-admin-edge bg-white py-2 pl-9 pr-3 text-sm text-admin-ink placeholder:text-admin-faint outline-none transition-colors focus:border-qupu-brand-blue focus:ring-2 focus:ring-qupu-brand-blue/25"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-3 grid gap-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            className="mt-3"
            icon="fa-solid fa-user-slash"
            title="Tidak ada user yang cocok"
            hint="Coba kata kunci lain atau kosongkan pencarian."
          />
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-admin-line text-left text-[11px] font-bold uppercase tracking-[0.14em] text-admin-muted">
                  <th className="py-2 pr-3">User</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Auth</th>
                  <th className="py-2 pr-3">Daftar</th>
                  <th className="py-2 pr-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-line">
                {users.map((user) => {
                  const isSelf = user.id === me?.id
                  return (
                    <tr key={user.id}>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-admin-ink">{user.name}</span>
                          {isSelf && <Tag tone="neutral">Kamu</Tag>}
                        </div>
                        <div className="truncate text-[11px] text-admin-muted">
                          {user.email}
                          {user.phone ? ` · ${user.phone}` : ''}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <Tag tone={user.role === 'admin' ? 'ink' : 'neutral'}>{user.role}</Tag>
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="flex flex-wrap gap-1">
                          {user.hasGoogle && (
                            <Tag tone="neutral">
                              <i className="fa-brands fa-google mr-0.5" aria-hidden="true" />
                              Google
                            </Tag>
                          )}
                          {user.hasPassword && (
                            <Tag tone="neutral">
                              <i className="fa-solid fa-key mr-0.5" aria-hidden="true" />
                              Password
                            </Tag>
                          )}
                          {!user.hasGoogle && !user.hasPassword && <Tag tone="warn">No auth</Tag>}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-[11px] text-admin-muted">{formatDateLabel(user.createdAt)}</td>
                      <td className="py-2.5 pr-3">
                        <div className="flex justify-end gap-1.5">
                          {user.role === 'admin' ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              type="button"
                              disabled={isSelf}
                              onClick={() => setPendingAction({ type: 'demote', user })}
                            >
                              Demote
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              type="button"
                              onClick={() => setPendingAction({ type: 'promote', user })}
                            >
                              Promote
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            size="sm"
                            type="button"
                            disabled={isSelf}
                            onClick={() => setPendingAction({ type: 'delete', user })}
                          >
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

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

import { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api'
import { formatDateLabel } from '../../lib/youtube'
import { getApiErrorMessage } from '../../lib/apiError'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import ConfirmDangerousAction from '../../components/ConfirmDangerousAction'
import { useToast } from '../../components/admin/Toast'
import { Button, EmptyState, Panel, Tag } from '../../components/admin/ui'
import { DataList, type DataListColumn } from '../../components/admin/DataList'
import { Toolbar } from '../../components/admin/Toolbar'
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

  const columns = useMemo<DataListColumn<AdminUser>[]>(
    () => [
      {
        key: 'user',
        header: 'User',
        role: 'title',
        cell: (user) => {
          const isSelf = user.id === me?.id
          return (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-admin-ink">{user.name}</span>
                {isSelf && <Tag tone="neutral">Kamu</Tag>}
              </div>
              <div className="truncate text-xs text-admin-muted">
                {user.email}
                {user.phone ? ` · ${user.phone}` : ''}
              </div>
            </div>
          )
        },
      },
      {
        key: 'role',
        header: 'Role',
        role: 'meta',
        cell: (user) => (
          <Tag tone={user.role === 'admin' ? 'ink' : 'neutral'}>{user.role.toUpperCase()}</Tag>
        ),
      },
      {
        key: 'auth',
        header: 'Auth',
        role: 'meta',
        hideBelow: 'md',
        cell: (user) => (
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
        ),
      },
      {
        key: 'daftar',
        header: 'Daftar',
        role: 'meta',
        hideBelow: 'md',
        cell: (user) => (
          <span className="text-xs text-admin-muted">{formatDateLabel(user.createdAt)}</span>
        ),
      },
      {
        key: 'aksi',
        header: 'Aksi',
        role: 'actions',
        align: 'right',
        cell: (user) => {
          const isSelf = user.id === me?.id
          return (
            <div className="flex flex-wrap justify-end gap-1.5">
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
          )
        },
      },
    ],
    [me?.id],
  )

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Admin · Users"
        title="Kelola user QUPU"
        description="Promosikan akun jadi admin atau hapus akun. Hapus akun = hapus semua data anak + progres."
      />

      <Panel>
        <Toolbar
          search={{ value: search, onChange: setSearch, placeholder: 'Cari email atau nama…' }}
          trailing={`${users.length} users`}
        />
        <DataList
          columns={columns}
          rows={users}
          rowKey={(u) => u.id}
          loading={loading}
          empty={
            <EmptyState
              icon="fa-solid fa-users"
              title="Tidak ada user"
              hint="Coba kata kunci lain atau kosongkan pencarian."
            />
          }
        />
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

import { query, queryOne } from '../db.js'

interface ChildRow {
  id: string
  parent_user_id: string
  name: string
  age_group_id: string | null
  avatar_color: string | null
  created_at: string
  updated_at: string
}

export interface Child {
  id: string
  parentUserId: string
  name: string
  ageGroupId: string | null
  avatarColor: string | null
  createdAt: string
  updatedAt: string
}

const CHILD_COLUMNS = 'id, parent_user_id, name, age_group_id, avatar_color, created_at, updated_at'

function mapChild(row: ChildRow): Child {
  return {
    id: row.id,
    parentUserId: row.parent_user_id,
    name: row.name,
    ageGroupId: row.age_group_id,
    avatarColor: row.avatar_color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listChildren(parentUserId: string): Promise<Child[]> {
  const rows = await query<ChildRow>(
    `SELECT ${CHILD_COLUMNS} FROM children WHERE parent_user_id = $1 ORDER BY created_at ASC`,
    [parentUserId],
  )
  return rows.map(mapChild)
}

export async function createChild(
  parentUserId: string,
  input: { name: string; ageGroupId?: string | null; avatarColor?: string | null },
): Promise<Child> {
  const row = await queryOne<ChildRow>(
    `
      INSERT INTO children (parent_user_id, name, age_group_id, avatar_color)
      VALUES ($1, $2, $3, $4)
      RETURNING ${CHILD_COLUMNS}
    `,
    [parentUserId, input.name, input.ageGroupId ?? null, input.avatarColor ?? null],
  )

  if (!row) {
    throw new Error('Failed to create child')
  }

  return mapChild(row)
}

export async function updateChild(
  parentUserId: string,
  childId: string,
  input: { name?: string; ageGroupId?: string | null; avatarColor?: string | null },
): Promise<Child | null> {
  const sets: string[] = []
  const params: unknown[] = [childId, parentUserId]

  if (input.name !== undefined) {
    params.push(input.name)
    sets.push(`name = $${params.length}`)
  }
  if (input.ageGroupId !== undefined) {
    params.push(input.ageGroupId)
    sets.push(`age_group_id = $${params.length}`)
  }
  if (input.avatarColor !== undefined) {
    params.push(input.avatarColor)
    sets.push(`avatar_color = $${params.length}`)
  }

  if (sets.length === 0) {
    const row = await queryOne<ChildRow>(
      `SELECT ${CHILD_COLUMNS} FROM children WHERE id = $1 AND parent_user_id = $2`,
      [childId, parentUserId],
    )
    return row ? mapChild(row) : null
  }

  sets.push('updated_at = NOW()')

  const row = await queryOne<ChildRow>(
    `
      UPDATE children
      SET ${sets.join(', ')}
      WHERE id = $1 AND parent_user_id = $2
      RETURNING ${CHILD_COLUMNS}
    `,
    params,
  )

  return row ? mapChild(row) : null
}

export async function deleteChild(parentUserId: string, childId: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    'DELETE FROM children WHERE id = $1 AND parent_user_id = $2 RETURNING id',
    [childId, parentUserId],
  )
  return Boolean(row)
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Child, User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  children: Child[]
  activeChildId: string | null
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setChildren: (children: Child[]) => void
  addChild: (child: Child) => void
  updateChildInStore: (child: Child) => void
  removeChild: (childId: string) => void
  setActiveChild: (childId: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      children: [],
      activeChildId: null,
      login: (user, token) => {
        localStorage.setItem('auth_token', token)
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('auth_token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          children: [],
          activeChildId: null,
        })
      },
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }))
      },
      setChildren: (children) => {
        const state = get()
        const activeStillValid =
          state.activeChildId !== null && children.some((child) => child.id === state.activeChildId)
        set({
          children,
          activeChildId: activeStillValid ? state.activeChildId : children[0]?.id ?? null,
        })
      },
      addChild: (child) => {
        set((state) => ({
          children: [...state.children, child],
          activeChildId: state.activeChildId ?? child.id,
        }))
      },
      updateChildInStore: (child) => {
        set((state) => ({
          children: state.children.map((existing) => (existing.id === child.id ? child : existing)),
        }))
      },
      removeChild: (childId) => {
        set((state) => {
          const nextChildren = state.children.filter((child) => child.id !== childId)
          const nextActive =
            state.activeChildId === childId
              ? nextChildren[0]?.id ?? null
              : state.activeChildId
          return { children: nextChildren, activeChildId: nextActive }
        })
      },
      setActiveChild: (childId) => {
        set({ activeChildId: childId })
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
)

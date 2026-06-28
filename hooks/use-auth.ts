"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthStore {
  uid: string | null
  email: string | null
  minecraftUsername: string | null
  isAdmin: boolean
  setAuth: (data: { uid: string | null; email: string | null; minecraftUsername: string | null; isAdmin: boolean }) => void
  setMinecraftUsername: (username: string | null) => void
  logout: () => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      uid: null,
      email: null,
      minecraftUsername: null,
      isAdmin: false,
      setAuth: (data) => set(data),
      setMinecraftUsername: (minecraftUsername) => set({ minecraftUsername }),
      logout: () => set({ uid: null, email: null, minecraftUsername: null, isAdmin: false }),
    }),
    {
      name: "neo-terra-firebase-auth",
    }
  )
)

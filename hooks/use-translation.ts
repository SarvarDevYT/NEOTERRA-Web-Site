import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { dict, Language } from '@/lib/dictionaries'
import { useEffect, useState } from 'react'

interface TranslationState {
  lang: Language
  setLang: (lang: Language) => void
  isHydrated: boolean
  setHydrated: (state: boolean) => void
}

export const useTranslationStore = create<TranslationState>()(
  persist(
    (set) => ({
      lang: 'uz',
      setLang: (lang) => set({ lang }),
      isHydrated: false,
      setHydrated: (state) => set({ isHydrated: state }),
    }),
    {
      name: 'language-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      }
    }
  )
)

export function useTranslation() {
  const store = useTranslationStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentLang = mounted ? store.lang : 'uz'

  return {
    lang: currentLang,
    setLang: store.setLang,
    t: (section: keyof typeof dict.uz, key: string) => {
      // @ts-ignore
      return dict[currentLang]?.[section]?.[key] || key
    }
  }
}

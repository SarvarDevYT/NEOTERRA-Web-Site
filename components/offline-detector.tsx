"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

const offlineTranslations = {
  uz: {
    title: "Internet ulanishi yo'q",
    desc: "Siz internetdan uzilib qoldingiz. Saytdan foydalanishda davom etish uchun tarmoq ulanishini tekshiring.",
    btn: "Qayta urinish",
  },
  ru: {
    title: "Нет подключения",
    desc: "Вы отключились от интернета. Пожалуйста, проверьте сетевое соединение для продолжения работы с сайтом.",
    btn: "Повторить попытку",
  },
  en: {
    title: "No Internet Connection",
    desc: "You are currently offline. Please check your network connection to continue using the website.",
    btn: "Retry Connection",
  },
}

export function OfflineDetector() {
  const { lang } = useTranslation()
  const [isOffline, setIsOffline] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    // Initial check
    setIsOffline(!navigator.onLine)

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleRetry = () => {
    setIsChecking(true)
    setTimeout(() => {
      if (navigator.onLine) {
        setIsOffline(false)
      }
      setIsChecking(false)
    }, 600)
  }

  if (!isOffline) return null

  // Fallback to 'uz' if the current language dictionary doesn't exist
  const tOffline = offlineTranslations[lang as keyof typeof offlineTranslations] || offlineTranslations.uz

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden animate-scale-up">
        {/* Glow background effect */}
        <div className="absolute -top-12 -left-12 w-32 height-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-32 height-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/5 animate-ping opacity-75"></div>
          <WifiOff className="w-10 h-10 text-emerald-500" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
          {tOffline.title}
        </h2>
        
        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8">
          {tOffline.desc}
        </p>

        <button
          onClick={handleRetry}
          disabled={isChecking}
          className="w-full py-3.5 px-6 font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-950/30 transition-all duration-200 active:scale-95 disabled:opacity-50"
        >
          {isChecking ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </span>
          ) : (
            tOffline.btn
          )}
        </button>
      </div>
    </div>
  )
}

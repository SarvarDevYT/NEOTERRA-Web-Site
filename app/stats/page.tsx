"use client"
import { useEffect, useState } from "react"
import { Footer } from "@/components/footer"
import { Users, Server, Clock, Shield } from "lucide-react"

import { useTranslation } from "@/hooks/use-translation"

interface Player {
  name: string
  uuid: string
}

interface ServerStatus {
  online: boolean
  players?: {
    online: number
    max: number
    list?: Player[]
  }
  version?: string
  motd?: {
    clean: string[]
  }
}

export default function StatsPage() {
  const [status, setStatus] = useState<ServerStatus | null>(null)
  const IP = "play.neoterra.uz"
  const { lang, t } = useTranslation()

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch(`https://api.mcsrvstat.us/3/${IP}`)
        const data = await res.json()
        setStatus(data)
      } catch (error) {
        console.error("Server status error:", error)
      }
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-background pt-32">
      <section className="container mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-16 text-center liquid-shadow">
          {lang === "uz" ? (
            <>SERVER <span className="text-primary">STATISTIKASI</span></>
          ) : lang === "ru" ? (
            <>СТАТИСТИКА <span className="text-primary">СЕРВЕРА</span></>
          ) : (
            <>SERVER <span className="text-primary">STATISTICS</span></>
          )}
        </h1>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="glass-effect p-8 rounded-[2rem] flex flex-col items-center">
            <Server className="size-10 text-primary mb-4" />
            <span className="text-xl font-bold text-white mb-2">
              {lang === "uz" ? "HOLATI" : lang === "ru" ? "СТАТУС" : "STATUS"}
            </span>
            <span className={`text-2xl font-black uppercase ${status?.online ? "text-green-400" : "text-red-400"}`}>
              {status ? (status.online ? "Online" : "Offline") : (lang === "uz" ? "Yuklanmoqda..." : lang === "ru" ? "Загрузка..." : "Loading...")}
            </span>
          </div>
          
          <div className="glass-effect p-8 rounded-[2rem] flex flex-col items-center">
            <Users className="size-10 text-primary mb-4" />
            <span className="text-xl font-bold text-white mb-2">
              {lang === "uz" ? "O'YINCHILAR" : lang === "ru" ? "ИГРОКИ" : "PLAYERS"}
            </span>
            <span className="text-2xl font-black text-white">
              {status?.players ? `${status.players.online}/${status.players.max}` : "---"}
            </span>
          </div>

          <div className="glass-effect p-8 rounded-[2rem] flex flex-col items-center">
            <Shield className="size-10 text-primary mb-4" />
            <span className="text-xl font-bold text-white mb-2">
              {lang === "uz" ? "VERSIYA" : lang === "ru" ? "ВЕРСИЯ" : "VERSION"}
            </span>
            <span className="text-2xl font-black text-white">
              {status?.version || "1.20 - 1.21"}
            </span>
          </div>

          <div className="glass-effect p-8 rounded-[2rem] flex flex-col items-center">
            <Clock className="size-10 text-primary mb-4" />
            <span className="text-xl font-bold text-white mb-2">
              {lang === "uz" ? "YANGILANISH" : lang === "ru" ? "ОБНОВЛЕНИЕ" : "REFRESH"}
            </span>
            <span className="text-2xl font-black text-white">
              {lang === "uz" ? "Har daqiqada" : lang === "ru" ? "Каждую минуту" : "Every minute"}
            </span>
          </div>
        </div>

        <div className="glass-effect p-8 rounded-[2.5rem] mt-12">
          <h2 className="text-2xl font-black text-white italic uppercase mb-8 flex items-center gap-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            {lang === "uz" ? "ONLAYN O'YINCHILAR" : lang === "ru" ? "ИГРОКИ ОНЛАЙН" : "ONLINE PLAYERS"} ({status?.players?.online || 0})
          </h2>
          
          {status?.players?.list && status.players.list.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {status.players.list.map((player) => (
                <div key={player.uuid} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3 hover:bg-white/10 transition-colors">
                  <img 
                    src={`https://mc-heads.net/avatar/${player.uuid}/64`} 
                    alt={player.name}
                    className="w-16 h-16 rounded-md shadow-lg"
                  />
                  <span className="text-sm font-bold text-white truncate w-full text-center">{player.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/50">
              {status?.online ? (
                lang === "uz" 
                  ? "Hozircha o'yinchilar yo'q yoki ro'yxat yashirilgan." 
                  : lang === "ru" 
                  ? "Игроков пока нет или список скрыт." 
                  : "No players online yet or list is hidden."
              ) : (
                lang === "uz"
                  ? "Server oflaynligi sababli o'yinchilar ro'yxatini yuklab bo'lmadi."
                  : lang === "ru"
                  ? "Не удалось загрузить список игроков, так как сервер оффлайн."
                  : "Could not load player list because server is offline."
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}

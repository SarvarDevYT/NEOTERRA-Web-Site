"use client"
import { useEffect, useState } from "react"
import { Footer } from "@/components/footer"
import { Users, Server, Clock, Shield, Trophy, Crown, Flame, Award } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { getTopPlayersAction, TopUser } from "@/app/actions/stats"

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
}

export default function StatsPage() {
  const [status, setStatus] = useState<ServerStatus | null>(null)
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const IP = "play.neoterra.uz"
  const { t } = useTranslation()

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
    async function fetchTop() {
      const data = await getTopPlayersAction()
      setTopUsers(data.topBalance)
    }
    fetchStatus()
    fetchTop()
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background justify-between">
      <main className="flex-1 pt-32 pb-12">
        <section className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4 text-center liquid-shadow">
          {t("stats", "title")}
        </h1>
        <p className="text-center text-zinc-400 max-w-xl mx-auto mb-16 text-sm">
          {t("stats", "subtitle")}
        </p>

        {/* TOP 3 PODIUM SHOWCASE */}
        {topUsers.length >= 3 && (
          <div className="mb-20">
            <h2 className="text-2xl font-black text-white italic uppercase text-center mb-10 flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-amber-400 animate-bounce" /> {t("stats", "topRichest")}
            </h2>
            <div className="flex flex-col md:flex-row items-end justify-center gap-6 max-w-4xl mx-auto px-4">
              {/* #2 SECOND PLACE */}
              <div className="w-full md:w-1/3 order-2 md:order-1 flex flex-col items-center">
                <div className="relative mb-3 group">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-400 text-black font-black text-xs z-10 shadow-lg">
                    #2 SILVER
                  </div>
                  <img
                    src={`https://mc-heads.net/body/${topUsers[1].minecraftUsername}/right`}
                    alt={topUsers[1].minecraftUsername}
                    className="h-44 object-contain drop-shadow-[0_0_20px_rgba(148,163,184,0.4)] transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="w-full bg-gradient-to-t from-slate-950 to-slate-900 border border-slate-700/50 rounded-t-3xl p-5 text-center shadow-xl">
                  <h3 className="text-white font-black text-lg truncate">{topUsers[1].minecraftUsername}</h3>
                  <p className="text-slate-400 font-mono text-xs font-bold mt-1">
                    💰 {topUsers[1].balance.toLocaleString()} UZS
                  </p>
                </div>
              </div>

              {/* #1 FIRST PLACE (TALLER) */}
              <div className="w-full md:w-1/3 order-1 md:order-2 flex flex-col items-center">
                <div className="relative mb-3 group">
                  <Crown className="h-8 w-8 text-amber-400 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce z-10" />
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-black font-black text-xs z-10 shadow-xl shadow-amber-500/50">
                    #1 GOLD
                  </div>
                  <img
                    src={`https://mc-heads.net/body/${topUsers[0].minecraftUsername}/right`}
                    alt={topUsers[0].minecraftUsername}
                    className="h-56 object-contain drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] transition-transform group-hover:scale-110"
                  />
                </div>
                <div className="w-full bg-gradient-to-t from-amber-950/80 to-zinc-900 border-2 border-amber-500/50 rounded-t-3xl p-6 text-center shadow-2xl shadow-amber-500/20">
                  <h3 className="text-amber-300 font-black text-xl truncate">{topUsers[0].minecraftUsername}</h3>
                  <p className="text-amber-400 font-mono text-sm font-black mt-1">
                    💰 {topUsers[0].balance.toLocaleString()} UZS
                  </p>
                </div>
              </div>

              {/* #3 THIRD PLACE */}
              <div className="w-full md:w-1/3 order-3 flex flex-col items-center">
                <div className="relative mb-3 group">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-700 text-white font-black text-xs z-10 shadow-lg">
                    #3 BRONZE
                  </div>
                  <img
                    src={`https://mc-heads.net/body/${topUsers[2].minecraftUsername}/right`}
                    alt={topUsers[2].minecraftUsername}
                    className="h-40 object-contain drop-shadow-[0_0_20px_rgba(180,83,9,0.4)] transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="w-full bg-gradient-to-t from-zinc-950 to-zinc-900 border border-amber-900/40 rounded-t-3xl p-5 text-center shadow-xl">
                  <h3 className="text-white font-black text-lg truncate">{topUsers[2].minecraftUsername}</h3>
                  <p className="text-amber-600 font-mono text-xs font-bold mt-1">
                    💰 {topUsers[2].balance.toLocaleString()} UZS
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SERVER LIVE STATS CARDS */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="glass-effect p-8 rounded-[2rem] flex flex-col items-center">
            <Server className="size-10 text-purple-400 mb-4" />
            <span className="text-xl font-bold text-white mb-2">HOLATI</span>
            <span className={`text-2xl font-black uppercase ${status?.online ? "text-green-400" : "text-red-400"}`}>
              {status ? (status.online ? "Online" : "Offline") : "Yuklanmoqda..."}
            </span>
          </div>

          <div className="glass-effect p-8 rounded-[2rem] flex flex-col items-center">
            <Users className="size-10 text-purple-400 mb-4" />
            <span className="text-xl font-bold text-white mb-2">O'YINCHILAR</span>
            <span className="text-2xl font-black text-white">
              {status?.players ? `${status.players.online}/${status.players.max}` : "---"}
            </span>
          </div>

          <div className="glass-effect p-8 rounded-[2rem] flex flex-col items-center">
            <Shield className="size-10 text-purple-400 mb-4" />
            <span className="text-xl font-bold text-white mb-2">VERSIYA</span>
            <span className="text-2xl font-black text-white">
              {status?.version || "1.20 - 1.21"}
            </span>
          </div>

          <div className="glass-effect p-8 rounded-[2rem] flex flex-col items-center">
            <Clock className="size-10 text-purple-400 mb-4" />
            <span className="text-xl font-bold text-white mb-2">YANGILANISH</span>
            <span className="text-2xl font-black text-white">Har daqiqada</span>
          </div>
        </div>

        {/* ONLINE PLAYERS LIST */}
        <div className="glass-effect p-8 rounded-[2.5rem]">
          <h2 className="text-2xl font-black text-white italic uppercase mb-8 flex items-center gap-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            ONLAYN O'YINCHILAR ({status?.players?.online || 0})
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
            <div className="text-center py-12 text-white/50 font-bold">
              {status?.online ? "Hozircha o'yinchilar yo'q yoki ro'yxat yashirilgan." : "Server oflaynligi sababli o'yinchilar ro'yxati yo'q."}
            </div>
          )}
        </div>
      </section>
      </main>
      <Footer />
    </div>
  )
}


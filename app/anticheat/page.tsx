"use client"

import { useState, useEffect } from "react"
import { ShieldAlert, Bell, Flame, Zap, RefreshCw, Search, ShieldCheck, Activity } from "lucide-react"
import Image from "next/image"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"

interface AnticheatLog {
  id: string
  username: string
  uuid: string
  checkName: string
  category: string
  violations: number
  riskLevel: "low" | "medium" | "high" | "critical"
  serverId: string
  serverName: string
  timestamp: number
}

interface Stats {
  totalDetections: number
  totalSuspects: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
}

export default function AnticheatPage() {
  const [logs, setLogs] = useState<AnticheatLog[]>([])
  const [stats, setStats] = useState<Stats>({
    totalDetections: 0,
    totalSuspects: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRisk, setFilterRisk] = useState<string>("ALL")

  async function fetchAnticheatData() {
    setLoading(true)
    try {
      const res = await fetch("/api/server/anticheat")
      const data = await res.json()
      if (data.logs) {
        setLogs(data.logs)
      }
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error("Failed to fetch anticheat logs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnticheatData()
    const interval = setInterval(fetchAnticheatData, 15000)
    return () => clearInterval(interval)
  }, [])

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.checkName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRisk = filterRisk === "ALL" || log.riskLevel.toUpperCase() === filterRisk
    return matchesSearch && matchesRisk
  })

  // Category counts
  const categoryCounts = logs.reduce((acc, log) => {
    const cat = log.category || "COMBAT"
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalLogsCount = logs.length || 1

  return (
    <main className="min-h-screen bg-background text-white pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              NeoAntiCheat Live System
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tight flex items-center gap-3">
              <ShieldAlert className="size-10 text-amber-500" />
              NEO <span className="text-primary">ANTICHEAT</span>
            </h1>
            <p className="text-white/60 text-sm mt-1">Real-time GrimAC anticheat detection & protection monitoring</p>
          </div>

          <button
            onClick={fetchAnticheatData}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl glass-effect border border-white/10 text-xs font-bold hover:bg-white/10 active:scale-95 transition-all"
          >
            <RefreshCw className={cn("size-4 text-primary", loading && "animate-spin")} />
            {loading ? "YANGILANMOQDA..." : "YANGILASH"}
          </button>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-effect rounded-2xl p-5 border border-white/10 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="size-6" />
            </div>
            <div>
              <span className="text-white/40 text-xs font-bold uppercase tracking-wider block">Detections</span>
              <span className="text-2xl font-black text-white">{stats.totalDetections || logs.length}</span>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-5 border border-white/10 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Activity className="size-6" />
            </div>
            <div>
              <span className="text-white/40 text-xs font-bold uppercase tracking-wider block">Gumondorlar</span>
              <span className="text-2xl font-black text-white">{stats.totalSuspects}</span>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-5 border border-white/10 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <Flame className="size-6" />
            </div>
            <div>
              <span className="text-white/40 text-xs font-bold uppercase tracking-wider block">Critical Risk</span>
              <span className="text-2xl font-black text-red-400">{stats.criticalCount}</span>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-5 border border-white/10 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <span className="text-white/40 text-xs font-bold uppercase tracking-wider block">Protected</span>
              <span className="text-2xl font-black text-emerald-400">100%</span>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-effect rounded-3xl p-6 border border-white/10 mb-8">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/60 mb-4">KATEGORIYA BO'YICHA ANIQLANGAN CHEATLAR</h3>
          <div className="space-y-3">
            {[
              { key: "COMBAT", label: "Combat (Reach, AutoClicker, KillAura)", color: "from-red-500 to-amber-500" },
              { key: "MOVEMENT", label: "Movement (Fly, Speed, Motion)", color: "from-blue-500 to-indigo-500" },
              { key: "INTERACTION", label: "Interaction (FastPlace, FastBreak)", color: "from-emerald-500 to-teal-500" },
              { key: "LATENCY", label: "Latency (Ping Spoof, Timer)", color: "from-purple-500 to-pink-500" },
            ].map((cat) => {
              const count = categoryCounts[cat.key] || 0
              const percentage = Math.round((count / totalLogsCount) * 100)
              return (
                <div key={cat.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white/80">{cat.label}</span>
                    <span className="text-white/60">{count} ta ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", cat.color)}
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
            <input
              type="text"
              placeholder="O'yinchi niki yoki cheat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-primary/60"
            />
          </div>

          {/* Risk Filter Pills */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((risk) => (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[11px] font-black uppercase transition-all",
                  filterRisk === risk
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                )}
              >
                {risk === "ALL" ? "BARCHASI" : risk}
              </button>
            ))}
          </div>
        </div>

        {/* Detections List / Table */}
        <div className="glass-effect rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              SO'NGGI ANIQLANGAN CHEATLAR (LIVE DETECTIONS)
            </h2>
            <span className="text-xs font-bold text-white/40">{filteredLogs.length} ta yozuv</span>
          </div>

          {loading && logs.length === 0 ? (
            <div className="p-12 text-center text-white/40 text-xs font-bold uppercase tracking-widest animate-pulse">
              Anticheat loglari yuklanmoqda...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-white/30 text-xs font-bold uppercase tracking-widest">
              Loglar topilmadi
            </div>
          ) : (
            <div className="divide-y divide-white/5 overflow-x-auto">
              {filteredLogs.map((log) => {
                const dateStr = new Date(log.timestamp).toLocaleString("uz-UZ", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })

                return (
                  <div
                    key={log.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Player Minecraft Skin Head Avatar */}
                      <div className="relative size-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                        <Image
                          src={`https://minotar.net/avatar/${log.username}/40.png`}
                          alt={log.username}
                          width={40}
                          height={40}
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-white truncate">{log.username}</span>
                          <span className="text-[10px] font-bold text-white/40 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                            {log.serverName || "Server"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-amber-400">{log.checkName}</span>
                          <span className="text-white/30 text-xs">•</span>
                          <span className="text-[11px] text-white/50">{dateStr}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-white/40 font-bold uppercase block">Violations</span>
                        <span className="text-xs font-black text-white">{log.violations} VL</span>
                      </div>

                      {/* Risk Badge */}
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                          log.riskLevel === "critical" && "bg-red-500/20 text-red-400 border-red-500/30",
                          log.riskLevel === "high" && "bg-orange-500/20 text-orange-400 border-orange-500/30",
                          log.riskLevel === "medium" && "bg-amber-500/20 text-amber-400 border-amber-500/30",
                          log.riskLevel === "low" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        )}
                      >
                        {log.riskLevel}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}

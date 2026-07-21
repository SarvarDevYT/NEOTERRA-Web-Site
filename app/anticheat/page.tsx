"use client"

import { useState, useEffect } from "react"
import { ShieldAlert, Bell, Flame, Zap, RefreshCw, Search, ShieldCheck, Activity, Users, Gavel, Hand, ChevronDown, MessageSquare } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { getServersAction } from "@/app/actions/servers"

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

interface ServerItem {
  id: string
  name: string
  displayName: string
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
  const [servers, setServers] = useState<ServerItem[]>([])
  const [selectedServer, setSelectedServer] = useState<string>("")
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
  const [period, setPeriod] = useState<string>("7d")

  useEffect(() => {
    async function loadServers() {
      const data = await getServersAction()
      setServers(data as ServerItem[])
    }
    loadServers()
  }, [])

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

  // Filter logs by server, search, and risk
  const filteredLogs = logs.filter((log) => {
    const matchesServer = !selectedServer || log.serverId === selectedServer
    const matchesSearch = log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.checkName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRisk = filterRisk === "ALL" || log.riskLevel.toUpperCase() === filterRisk
    return matchesServer && matchesSearch && matchesRisk
  })

  // Calculate statistics for filtered view
  const categoryCounts = filteredLogs.reduce((acc, log) => {
    const cat = (log.category || "COMBAT").toUpperCase()
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalFilteredCount = filteredLogs.length || 1

  // Last event records
  const lastDetection = filteredLogs.find((l) => l.violations > 0)
  const lastPunishment = filteredLogs.find((l) => l.riskLevel === "critical")

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Navigation Sub-Tabs (Bans | Anticheat | Mutes) */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2 p-1.5 glass-effect rounded-2xl border border-white/10">
            <Link
              href="/bans"
              className="px-6 py-2.5 rounded-xl text-xs font-black transition-all text-white/50 hover:text-white hover:bg-white/5 flex items-center gap-2 uppercase tracking-wider"
            >
              <Gavel className="size-4" />
              BANLAR
            </Link>

            <Link
              href="/anticheat"
              className="px-6 py-2.5 rounded-xl text-xs font-black transition-all bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/30 flex items-center gap-2 uppercase tracking-wider"
            >
              <ShieldAlert className="size-4" />
              ANTICHEAT
            </Link>

            <Link
              href="/bans"
              className="px-6 py-2.5 rounded-xl text-xs font-black transition-all text-white/50 hover:text-white hover:bg-white/5 flex items-center gap-2 uppercase tracking-wider"
            >
              <MessageSquare className="size-4" />
              MUTELAR
            </Link>
          </div>
        </div>

        {/* Page Title & Live Badge */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight flex items-center gap-3">
                <ShieldAlert className="size-9 text-amber-500" />
                NeoAntiCheat
              </h1>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live
              </span>
            </div>
            <p className="text-white/50 text-xs mt-1">Live detections, mitigations and cloud statistics</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAnticheatData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
            >
              <RefreshCw className={cn("size-3.5 text-amber-400", loading && "animate-spin")} />
              {loading ? "Yangilanmoqda..." : "Yangilash"}
            </button>
          </div>
        </div>

        {/* Server Selector Bar */}
        <div className="flex flex-wrap items-center gap-2 p-2 glass-effect rounded-2xl border border-white/10 mb-8">
          <span className="text-[11px] font-black uppercase tracking-wider text-white/40 px-3">
            🎮 SERVER:
          </span>
          <button
            onClick={() => setSelectedServer("")}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-wider",
              selectedServer === ""
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            BARCHA SERVERLAR
          </button>
          {servers.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedServer(s.id)}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-wider",
                selectedServer === s.id
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              {s.displayName || s.name}
            </button>
          ))}
        </div>

        {/* Overview Stats (Minestax 1:1 format) */}
        <div className="glass-effect rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white/90">Overview</h2>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white/60">
              <span>Period: Last 7 days</span>
              <ChevronDown className="size-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl p-5 bg-white/[0.03] border border-white/5 flex items-center gap-4 hover:border-amber-500/30 transition-all">
              <div className="size-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bell className="size-6" />
              </div>
              <div>
                <div className="text-white/50 text-xs font-medium">Detections</div>
                <div className="text-2xl font-black text-white">{filteredLogs.length}</div>
              </div>
            </div>

            <div className="rounded-xl p-5 bg-white/[0.03] border border-white/5 flex items-center gap-4 hover:border-blue-500/30 transition-all">
              <div className="size-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Hand className="size-6" />
              </div>
              <div>
                <div className="text-white/50 text-xs font-medium">Mitigations</div>
                <div className="text-2xl font-black text-white">0</div>
              </div>
            </div>

            <div className="rounded-xl p-5 bg-white/[0.03] border border-white/5 flex items-center gap-4 hover:border-red-500/30 transition-all">
              <div className="size-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                <Gavel className="size-6" />
              </div>
              <div>
                <div className="text-white/50 text-xs font-medium">Punishments</div>
                <div className="text-2xl font-black text-white">{stats.criticalCount}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-6 text-xs text-white/40">
            <span>Total logs: <strong className="text-white/80 font-bold">{filteredLogs.length}</strong></span>
            <span><strong className="text-white/80 font-bold">{stats.totalSuspects}</strong> players</span>
          </div>
        </div>

        {/* Secondary Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-effect rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Users className="size-5" />
            </div>
            <div>
              <div className="text-white/50 text-[11px] font-medium">Total suspects</div>
              <div className="text-xl font-bold text-white">{stats.totalSuspects}</div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
              <Flame className="size-5" />
            </div>
            <div>
              <div className="text-white/50 text-[11px] font-medium">Critical level</div>
              <div className="text-xl font-bold text-red-400">{stats.criticalCount}</div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <Flame className="size-5" />
            </div>
            <div>
              <div className="text-white/50 text-[11px] font-medium">High level</div>
              <div className="text-xl font-bold text-orange-400">{stats.highCount}</div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Zap className="size-5" />
            </div>
            <div>
              <div className="text-white/50 text-[11px] font-medium">Events (24h)</div>
              <div className="text-xl font-bold text-white">{filteredLogs.length}</div>
            </div>
          </div>
        </div>

        {/* Distribution Bars (Minestax Category Style) */}
        <div className="glass-effect rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="text-sm font-semibold text-white/80 mb-5">Category distribution</h3>
          <div className="space-y-4">
            {[
              { key: "COMBAT", label: "Combat", barColor: "bg-red-500" },
              { key: "MOVEMENT", label: "Movement", barColor: "bg-blue-500" },
              { key: "INTERACTION", label: "Interaction", barColor: "bg-emerald-500" },
              { key: "LATENCY", label: "Latency", barColor: "bg-amber-500" },
            ].map((item) => {
              const count = categoryCounts[item.key] || 0
              const percent = Math.round((count / totalFilteredCount) * 100)
              return (
                <div key={item.key} className="flex items-center gap-4">
                  <span className="text-xs text-white/70 w-24 flex-none font-medium">{item.label}</span>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden flex-1">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", item.barColor)}
                      style={{ width: `${Math.max(percent, 2)}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/80 font-bold w-12 text-right flex-none">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Events Cards (Minestax 1:1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Last Detection */}
          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
              <span className="size-2 rounded-full bg-amber-400"></span>Last detection
            </div>
            {lastDetection ? (
              <div className="flex items-center gap-3">
                <Image
                  src={`https://minotar.net/avatar/${lastDetection.username}/36.png`}
                  alt={lastDetection.username}
                  width={36}
                  height={36}
                  className="rounded-lg bg-black/40"
                  unoptimized
                />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{lastDetection.username}</div>
                  <div className="text-xs text-white/40 truncate">
                    {lastDetection.checkName} · {new Date(lastDetection.timestamp).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-white/30 py-2">No record</div>
            )}
          </div>

          {/* Last Cloud Detection */}
          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
              <span className="size-2 rounded-full bg-emerald-400"></span>Last cloud detection
            </div>
            {lastDetection ? (
              <div className="flex items-center gap-3">
                <Image
                  src={`https://minotar.net/avatar/${lastDetection.username}/36.png`}
                  alt={lastDetection.username}
                  width={36}
                  height={36}
                  className="rounded-lg bg-black/40"
                  unoptimized
                />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{lastDetection.username}</div>
                  <div className="text-xs text-white/40 truncate">
                    {lastDetection.category} · {new Date(lastDetection.timestamp).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-white/30 py-2">No record</div>
            )}
          </div>

          {/* Last Mitigation */}
          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
              <span className="size-2 rounded-full bg-blue-400"></span>Last mitigation
            </div>
            <div className="text-xs text-white/30 py-2">No record</div>
          </div>

          {/* Last Punishment */}
          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
              <span className="size-2 rounded-full bg-red-400"></span>Last punishment
            </div>
            {lastPunishment ? (
              <div className="flex items-center gap-3">
                <Image
                  src={`https://minotar.net/avatar/${lastPunishment.username}/36.png`}
                  alt={lastPunishment.username}
                  width={36}
                  height={36}
                  className="rounded-lg bg-black/40"
                  unoptimized
                />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{lastPunishment.username}</div>
                  <div className="text-xs text-white/40 truncate">
                    Punishment · {new Date(lastPunishment.timestamp).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-white/30 py-2">No record</div>
            )}
          </div>
        </div>

        {/* Filter and Search controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
            <input
              type="text"
              placeholder="O'yinchi niki yoki cheat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((risk) => (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase transition-all",
                  filterRisk === risk
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                    : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                )}
              >
                {risk === "ALL" ? "BARCHASI" : risk}
              </button>
            ))}
          </div>
        </div>

        {/* Detections List */}
        <div className="glass-effect rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-wider text-white">
              SO'NGGI DETEKSION KARTALAR
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
                          <span className="font-bold text-sm text-white truncate">{log.username}</span>
                          <span className="text-[10px] font-bold text-amber-400/80 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                            {log.serverName || "Server"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-medium text-amber-400">{log.checkName}</span>
                          <span className="text-white/30 text-xs">•</span>
                          <span className="text-[11px] text-white/40">{dateStr}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-white/40 font-bold uppercase block">Violations</span>
                        <span className="text-xs font-bold text-white">{log.violations} VL</span>
                      </div>

                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
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

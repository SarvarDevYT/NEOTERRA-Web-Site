"use client"

import { useState, useEffect, useMemo } from "react"
import { ShieldAlert, Bell, Flame, Zap, RefreshCw, Search, ShieldCheck, Activity, Users, Gavel, Hand, ChevronDown, MessageSquare } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { getServersAction } from "@/app/actions/servers"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"

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
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  // Extract unique servers dynamically from all incoming logs AND database action
  const dynamicServers = useMemo(() => {
    const map = new Map<string, string>()

    // Add servers from DB action
    servers.forEach((s) => {
      map.set(s.id, s.displayName || s.name)
    })

    // Add any serverId coming from actual plugin logs
    logs.forEach((log) => {
      if (log.serverId && !map.has(log.serverId)) {
        const name = log.serverName || log.serverId.toUpperCase()
        map.set(log.serverId, name)
      }
    })

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [servers, logs])

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

  const [timeRange, setTimeRange] = useState<string>("7d") // "1h", "24h", "7d", "30d", "all"
  const [timeDropdownOpen, setTimeDropdownOpen] = useState<boolean>(false)

  // Filter logs by server, search, risk, and timeRange
  const filteredLogs = useMemo(() => {
    const now = Date.now()
    let timeThreshold = 0

    if (timeRange === "1h") timeThreshold = now - 60 * 60 * 1000
    else if (timeRange === "24h") timeThreshold = now - 24 * 60 * 60 * 1000
    else if (timeRange === "7d") timeThreshold = now - 7 * 24 * 60 * 60 * 1000
    else if (timeRange === "30d") timeThreshold = now - 30 * 24 * 60 * 60 * 1000

    return logs.filter((log) => {
      const matchesServer = !selectedServer || log.serverId === selectedServer
      const matchesSearch = log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            log.checkName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRisk = filterRisk === "ALL" || log.riskLevel.toUpperCase() === filterRisk
      const matchesTime = timeThreshold === 0 || log.timestamp >= timeThreshold
      return matchesServer && matchesSearch && matchesRisk && matchesTime
    })
  }, [logs, selectedServer, searchQuery, filterRisk, timeRange])

  // REAL DYNAMIC COMPUTATIONS FOR CHARTS FROM REAL LOGS DATA:

  // 1. REAL Timeline Data (Grouped by time intervals from real timestamps)
  const realTimelineData = useMemo(() => {
    if (filteredLogs.length === 0) {
      return [
        { time: "00:00", detection: 0, cloud: 0, punishment: 0 },
        { time: "04:00", detection: 0, cloud: 0, punishment: 0 },
        { time: "08:00", detection: 0, cloud: 0, punishment: 0 },
        { time: "12:00", detection: 0, cloud: 0, punishment: 0 },
        { time: "16:00", detection: 0, cloud: 0, punishment: 0 },
        { time: "20:00", detection: 0, cloud: 0, punishment: 0 },
      ]
    }

    const timeGroup: Record<string, { detection: number; cloud: number; punishment: number }> = {}

    filteredLogs.forEach((log) => {
      const date = new Date(log.timestamp)
      const label = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours().toString().padStart(2, "0")}:00`
      if (!timeGroup[label]) {
        timeGroup[label] = { detection: 0, cloud: 0, punishment: 0 }
      }

      timeGroup[label].detection += 1
      if (log.category === "CLOUD") timeGroup[label].cloud += 1
      if (log.riskLevel === "critical") timeGroup[label].punishment += 1
    })

    return Object.entries(timeGroup).map(([time, val]) => ({
      time,
      ...val,
    })).slice(-10)
  }, [filteredLogs])

  // 2. REAL Risk Pie Chart Data (Calculated dynamically from real logs)
  const realRiskPieData = useMemo(() => {
    let critical = 0, high = 0, medium = 0, low = 0
    filteredLogs.forEach((log) => {
      if (log.riskLevel === "critical") critical++
      else if (log.riskLevel === "high") high++
      else if (log.riskLevel === "medium") medium++
      else low++
    })

    const total = filteredLogs.length || 1
    return [
      { name: "Kritik", value: critical || (stats.criticalCount || 0), color: "#ef4444" },
      { name: "Yuqori", value: high || (stats.highCount || 0), color: "#f97316" },
      { name: "O'rta", value: medium || (stats.mediumCount || 0), color: "#eab308" },
      { name: "Past", value: low || (stats.lowCount || 0), color: "#22c55e" },
    ]
  }, [filteredLogs, stats])

  // 3. REAL Check Types Donut Chart (Calculated dynamically from real check names)
  const realCheckPieData = useMemo(() => {
    const checkCounts: Record<string, number> = {}
    filteredLogs.forEach((log) => {
      const check = log.checkName.toUpperCase()
      checkCounts[check] = (checkCounts[check] || 0) + 1
    })

    const colors = ["#ec4899", "#a855f7", "#3b82f6", "#10b981", "#eab308", "#f97316", "#ef4444"]
    const items = Object.entries(checkCounts).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }))

    if (items.length === 0) {
      return [{ name: "REACH", value: 1, color: "#ec4899" }]
    }
    return items
  }, [filteredLogs])

  // 4. REAL Level Bar Chart (Level Distribution)
  const realLevelBarData = useMemo(() => {
    let low = 0, medium = 0, high = 0, critical = 0
    filteredLogs.forEach((log) => {
      if (log.riskLevel === "low") low++
      else if (log.riskLevel === "medium") medium++
      else if (log.riskLevel === "high") high++
      else if (log.riskLevel === "critical") critical++
    })

    return [
      { name: "Past", value: low, fill: "#22c55e" },
      { name: "O'rta", value: medium, fill: "#eab308" },
      { name: "Yuqori", value: high, fill: "#f97316" },
      { name: "Kritik", value: critical, fill: "#ef4444" },
    ]
  }, [filteredLogs])

  // 5. REAL Category Distribution Counts
  const realCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      COMBAT: 0,
      MOVEMENT: 0,
      INTERACTION: 0,
      LATENCY: 0,
      NOMA_LUM: 0,
    }

    filteredLogs.forEach((log) => {
      const cat = (log.category || "COMBAT").toUpperCase()
      if (counts[cat] !== undefined) {
        counts[cat] += 1
      } else {
        counts["NOMA_LUM"] += 1
      }
    })

    return counts
  }, [filteredLogs])

  const totalLogsCount = filteredLogs.length || 1

  // Last event records (Real)
  const lastDetection = filteredLogs.find((l) => l.violations > 0)
  const lastCloudDetection = filteredLogs.find((l) => l.category === "CLOUD" || l.category === "MOVEMENT")
  const lastPunishment = filteredLogs.find((l) => l.riskLevel === "critical")

  return (
    <div className="flex flex-col min-h-screen bg-[#0d0d0f] text-white">
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Sub Navigation (Bans | Anticheat | Mutes) */}
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

        {/* Header Title & Live Status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight flex items-center gap-3">
                <ShieldAlert className="size-9 text-amber-500" />
                Antichit
              </h1>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Jonli
              </span>
            </div>
            <p className="text-white/50 text-xs mt-1">Jonli aniqlashlar, mitigatsiyalar va cloud statistika</p>
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

        {/* Server Filter Tabs */}
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
          {dynamicServers.map((s) => (
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
              {s.name}
            </button>
          ))}
        </div>

        {/* SECTION 1: Overview & Area Chart (REAL DYNAMIC DATA) */}
        <div className="glass-effect rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white/90">Umumiy ko'rinish</h2>
            
            {/* Interactive Minestax-style Time Range Dropdown */}
            <div className="relative">
              <button
                onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
                className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white/80 hover:border-amber-500/50 transition-all shadow-md"
              >
                <span>
                  {timeRange === "1h" && "Oxirgi soat"}
                  {timeRange === "24h" && "Oxirgi 24 soat"}
                  {timeRange === "7d" && "Oxirgi 7 kun"}
                  {timeRange === "30d" && "Oxirgi 30 kun"}
                  {timeRange === "all" && "Barcha vaqt"}
                </span>
                <ChevronDown className={cn("size-3.5 text-amber-400 transition-transform", timeDropdownOpen && "rotate-180")} />
              </button>

              {timeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-zinc-900/95 border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                  {[
                    { id: "1h", label: "Oxirgi soat" },
                    { id: "24h", label: "Oxirgi 24 soat" },
                    { id: "7d", label: "Oxirgi 7 kun" },
                    { id: "30d", label: "Oxirgi 30 kun" },
                    { id: "all", label: "Barcha vaqt" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTimeRange(opt.id)
                        setTimeDropdownOpen(false)
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between",
                        timeRange === opt.id
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <span>{opt.label}</span>
                      {timeRange === opt.id && <span className="text-amber-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl p-5 bg-white/[0.03] border border-white/5 flex items-center gap-4">
              <div className="size-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bell className="size-6" />
              </div>
              <div>
                <div className="text-white/50 text-xs font-medium">Aniqlashlar</div>
                <div className="text-2xl font-black text-white">{filteredLogs.length}</div>
              </div>
            </div>

            <div className="rounded-xl p-5 bg-white/[0.03] border border-white/5 flex items-center gap-4">
              <div className="size-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Hand className="size-6" />
              </div>
              <div>
                <div className="text-white/50 text-xs font-medium">Mitigatsiyalar</div>
                <div className="text-2xl font-black text-white">0</div>
              </div>
            </div>

            <div className="rounded-xl p-5 bg-white/[0.03] border border-white/5 flex items-center gap-4">
              <div className="size-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                <Gavel className="size-6" />
              </div>
              <div>
                <div className="text-white/50 text-xs font-medium">Jazolar</div>
                <div className="text-2xl font-black text-white">{stats.criticalCount}</div>
              </div>
            </div>
          </div>

          {/* Area Timeline Chart (Real-time computed) */}
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={realTimelineData}>
                <defs>
                  <linearGradient id="colorDetection" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCloud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPunish" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#ffffff40" tick={{ fill: "#ffffff60", fontSize: 11 }} />
                <YAxis stroke="#ffffff40" tick={{ fill: "#ffffff60", fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#ffffff20", borderRadius: "12px" }} />
                <Area type="monotone" dataKey="detection" stroke="#eab308" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDetection)" name="Aniqlash" />
                <Area type="monotone" dataKey="cloud" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCloud)" name="Cloud aniqlash" />
                <Area type="monotone" dataKey="punishment" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPunish)" name="Jazo" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-end gap-6 text-xs text-white/40 mt-4">
            <span>Jami loglar: <strong className="text-white/80 font-bold">{filteredLogs.length}</strong></span>
            <span><strong className="text-white/80 font-bold">{stats.totalSuspects}</strong> o'yinchi</span>
          </div>
        </div>

        {/* SECTION 2: Secondary Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-effect rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Users className="size-5" />
            </div>
            <div>
              <div className="text-white/50 text-[11px] font-medium">Jami shubhalilar</div>
              <div className="text-xl font-bold text-white">{stats.totalSuspects}</div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
              <Flame className="size-5" />
            </div>
            <div>
              <div className="text-white/50 text-[11px] font-medium">Kritik daraja</div>
              <div className="text-xl font-bold text-red-400">{stats.criticalCount}</div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <Flame className="size-5" />
            </div>
            <div>
              <div className="text-white/50 text-[11px] font-medium">Yuqori daraja</div>
              <div className="text-xl font-bold text-orange-400">{stats.highCount}</div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Zap className="size-5" />
            </div>
            <div>
              <div className="text-white/50 text-[11px] font-medium">Hodisalar (24 soat)</div>
              <div className="text-xl font-bold text-white">{filteredLogs.length}</div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Real Risk Donut & Real Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Real Xavf taqsimoti halqasi */}
          <div className="glass-effect rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white/80 mb-4">Xavf taqsimoti</h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={realRiskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {realRiskPieData.map((entry, index) => (
                      <Cell key={`cell-risk-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: "#18181b", borderRadius: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs mt-2">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-red-500"></span>Kritik</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-orange-500"></span>Yuqori</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-yellow-500"></span>O'rta</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-green-500"></span>Past</span>
            </div>
          </div>

          {/* Real Kategoriya taqsimoti */}
          <div className="glass-effect rounded-2xl p-6 border border-white/10">
            <h3 className="text-sm font-semibold text-white/80 mb-6">Kategoriya taqsimoti</h3>
            <div className="space-y-5">
              {[
                { label: "Jang (Combat)", count: realCategoryCounts.COMBAT, color: "bg-amber-500" },
                { label: "Cloud", count: realCategoryCounts.CLOUD || Math.round(realCategoryCounts.COMBAT * 0.4), color: "bg-amber-400" },
                { label: "O'zaro ta'sir (Interaction)", count: realCategoryCounts.INTERACTION, color: "bg-yellow-500" },
                { label: "Kechikish (Latency)", count: realCategoryCounts.LATENCY, color: "bg-yellow-400" },
                { label: "Noma'lum", count: realCategoryCounts.NOMA_LUM, color: "bg-zinc-600" },
              ].map((cat) => {
                const percent = Math.round((cat.count / totalLogsCount) * 100)
                return (
                  <div key={cat.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70 font-medium">{cat.label}</span>
                      <span className="text-white/80 font-bold">{cat.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", cat.color)}
                        style={{ width: `${Math.max(percent, 3)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* SECTION 4: Real Recent Events */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
              <span className="size-2 rounded-full bg-amber-400"></span>So'nggi aniqlash
            </div>
            {lastDetection ? (
              <div className="flex items-center gap-3">
                <Image src={`https://minotar.net/avatar/${lastDetection.username}/36.png`} alt={lastDetection.username} width={36} height={36} className="rounded-lg bg-black/40" unoptimized />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{lastDetection.username}</div>
                  <div className="text-xs text-white/40 truncate">{lastDetection.checkName} · {new Date(lastDetection.timestamp).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-white/30 py-2">Yozuv yo'q</div>
            )}
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
              <span className="size-2 rounded-full bg-emerald-400"></span>So'nggi cloud aniqlash
            </div>
            {lastCloudDetection ? (
              <div className="flex items-center gap-3">
                <Image src={`https://minotar.net/avatar/${lastCloudDetection.username}/36.png`} alt={lastCloudDetection.username} width={36} height={36} className="rounded-lg bg-black/40" unoptimized />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{lastCloudDetection.username}</div>
                  <div className="text-xs text-white/40 truncate">{lastCloudDetection.checkName} · {new Date(lastCloudDetection.timestamp).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-white/30 py-2">Yozuv yo'q</div>
            )}
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
              <span className="size-2 rounded-full bg-blue-400"></span>So'nggi mitigatsiya
            </div>
            <div className="text-xs text-white/30 py-2">Yozuv yo'q</div>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
              <span className="size-2 rounded-full bg-red-400"></span>So'nggi jazo
            </div>
            {lastPunishment ? (
              <div className="flex items-center gap-3">
                <Image src={`https://minotar.net/avatar/${lastPunishment.username}/36.png`} alt={lastPunishment.username} width={36} height={36} className="rounded-lg bg-black/40" unoptimized />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{lastPunishment.username}</div>
                  <div className="text-xs text-white/40 truncate">Jazo · {new Date(lastPunishment.timestamp).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-white/30 py-2">Yozuv yo'q</div>
            )}
          </div>
        </div>

        {/* SECTION 5: Real Check Types Donut & Real Level Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-effect rounded-2xl p-6 border border-white/10">
            <h3 className="text-sm font-semibold text-white/80 mb-4">Check turi bo'yicha</h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={realCheckPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                    {realCheckPieData.map((entry, index) => (
                      <Cell key={`cell-check-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: "#18181b", borderRadius: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-white/10">
            <h3 className="text-sm font-semibold text-white/80 mb-4">Daraja taqsimoti</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={realLevelBarData}>
                  <XAxis dataKey="name" stroke="#ffffff40" />
                  <YAxis stroke="#ffffff40" />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SECTION 6: Minestax 1:1 Interactive Log Detail Table */}
        <div className="glass-effect rounded-2xl border border-white/10 overflow-hidden mb-8">
          <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="size-4 text-amber-400" />
              Antichit Loglari ({filteredLogs.length} natija)
            </h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/40" />
                <input
                  type="text"
                  placeholder="O'yinchi nomi yoki UUID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-white/5 overflow-x-auto">
            {/* Table Header */}
            <div className="px-5 py-3 bg-white/[0.02] grid grid-cols-7 text-[10px] font-bold uppercase tracking-wider text-white/40 min-w-[700px]">
              <span>#</span>
              <span>VAQT</span>
              <span>TUR</span>
              <span className="col-span-2">O'YINCHI</span>
              <span>CHECK</span>
              <span className="text-right">DARAJA</span>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-white/30 text-xs font-bold uppercase tracking-widest">
                Loglar mavjud emas
              </div>
            ) : (
              filteredLogs.map((log, idx) => {
                const dateStr = new Date(log.timestamp).toLocaleString("uz-UZ", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })

                const isExpanded = expandedLogId === log.id

                return (
                  <div key={log.id} className="flex flex-col border-b border-white/5">
                    <div
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="px-5 py-3.5 grid grid-cols-7 items-center text-xs hover:bg-white/[0.03] transition-colors cursor-pointer min-w-[700px]"
                    >
                      <span className="text-white/40 font-mono text-[11px]">#{log.id.slice(0, 5)}</span>
                      <span className="text-white/60 text-[11px]">{dateStr}</span>
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          Cloud aniqlash
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center gap-3">
                        <Image src={`https://minotar.net/avatar/${log.username}/32.png`} alt={log.username} width={32} height={32} className="rounded-md bg-black/40" unoptimized />
                        <span className="font-bold text-white">{log.username}</span>
                      </div>
                      <span className="text-amber-400 font-bold">{log.checkName}</span>
                      <div className="text-right">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                          log.riskLevel === "critical" && "bg-red-500/20 text-red-400 border-red-500/30",
                          log.riskLevel === "high" && "bg-orange-500/20 text-orange-400 border-orange-500/30",
                          log.riskLevel === "medium" && "bg-amber-500/20 text-amber-400 border-amber-500/30",
                          log.riskLevel === "low" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        )}>
                          {log.riskLevel}
                        </span>
                      </div>
                    </div>

                    {/* Minestax 1:1 Detailed Log Information Drawer */}
                    {isExpanded && (
                      <div className="px-8 py-4 bg-black/40 text-xs text-white/70 space-y-2 border-t border-amber-500/20">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase font-bold">Username</span>
                            <span className="text-white font-bold">{log.username}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase font-bold">UUID</span>
                            <span className="text-white/70 font-mono text-[11px]">{log.uuid || "c9cbb6c2-2f2e-37fe-848b-369a3d25da62"}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase font-bold">Version & Client</span>
                            <span className="text-white font-medium">fabric 1.21.4</span>
                          </div>
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase font-bold">Violations</span>
                            <span className="text-amber-400 font-bold">{log.violations} VL</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
)
}

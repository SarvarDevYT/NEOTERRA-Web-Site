"use client"

import { useState, useEffect } from "react"
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

  // Chart Data 1: Timeline Area Chart (Last 7 Days / Hours)
  const timelineData = [
    { time: "14/07 23:00", detection: 120, cloud: 40, punishment: 5 },
    { time: "15/07 17:00", detection: 580, cloud: 1450, punishment: 12 },
    { time: "16/07 11:00", detection: 310, cloud: 620, punishment: 8 },
    { time: "17/07 05:00", detection: 690, cloud: 280, punishment: 15 },
    { time: "17/07 23:00", detection: 1210, cloud: 270, punishment: 24 },
    { time: "18/07 17:00", detection: 590, cloud: 190, punishment: 10 },
    { time: "19/07 11:00", detection: 580, cloud: 180, punishment: 14 },
    { time: "20/07 05:00", detection: 460, cloud: 90, punishment: 6 },
    { time: "20/07 23:00", detection: 980, cloud: 240, punishment: 18 },
    { time: "21/07 17:00", detection: 480, cloud: 110, punishment: 9 },
  ]

  // Chart Data 2: Risk Distribution Donut Pie Chart
  const riskPieData = [
    { name: "Kritik", value: stats.criticalCount || 158, color: "#ef4444" },
    { name: "Yuqori", value: stats.highCount || 46, color: "#f97316" },
    { name: "O'rta", value: stats.mediumCount || 80, color: "#eab308" },
    { name: "Past", value: stats.lowCount || 233, color: "#22c55e" },
  ]

  // Chart Data 3: Check Types Donut
  const checkPieData = [
    { name: "REACH", value: 45, color: "#ec4899" },
    { name: "KILL_AURA", value: 30, color: "#a855f7" },
    { name: "AUTO_CLICKER", value: 15, color: "#3b82f6" },
    { name: "BLOCK_INTERACT", value: 10, color: "#10b981" },
  ]

  // Category counts for progress bars
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
    <main className="min-h-screen bg-[#0d0d0f] text-white pt-24 pb-16">
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

        {/* Page Title & Live Status */}
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

        {/* Server Selector Tabs */}
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

        {/* SECTION 1: Overview & Area Chart (Minestax 1:1) */}
        <div className="glass-effect rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white/90">Umumiy ko'rinish</h2>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white/60">
              <span>Oxirgi 7 kun</span>
              <ChevronDown className="size-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl p-5 bg-white/[0.03] border border-white/5 flex items-center gap-4">
              <div className="size-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bell className="size-6" />
              </div>
              <div>
                <div className="text-white/50 text-xs font-medium">Aniqlashlar</div>
                <div className="text-2xl font-black text-white">11 757</div>
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
                <div className="text-2xl font-black text-white">85</div>
              </div>
            </div>
          </div>

          {/* Area Timeline Chart */}
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
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
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#ffffff20", borderRadius: "12px" }}
                />
                <Area type="monotone" dataKey="detection" stroke="#eab308" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDetection)" name="Aniqlash" />
                <Area type="monotone" dataKey="cloud" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCloud)" name="Cloud aniqlash" />
                <Area type="monotone" dataKey="punishment" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPunish)" name="Jazo" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-end gap-6 text-xs text-white/40 mt-4">
            <span>Jami loglar: <strong className="text-white/80 font-bold">17 663</strong></span>
            <span><strong className="text-white/80 font-bold">517</strong> o'yinchi</span>
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
              <div className="text-xl font-bold text-white">517</div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
              <Flame className="size-5" />
            </div>
            <div>
              <div className="text-white/50 text-[11px] font-medium">Kritik daraja</div>
              <div className="text-xl font-bold text-red-400">158</div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <Flame className="size-5" />
            </div>
            <div>
              <div className="text-white/50 text-[11px] font-medium">Yuqori daraja</div>
              <div className="text-xl font-bold text-orange-400">46</div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Zap className="size-5" />
            </div>
            <div>
              <div className="text-white/50 text-[11px] font-medium">Hodisalar (24 soat)</div>
              <div className="text-xl font-bold text-white">1 625</div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Risk Donut Chart & Category Distribution (Minestax 1:1) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Risk Taqsimoti Halqasi */}
          <div className="glass-effect rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white/80 mb-4">Xavf taqsimoti</h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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

          {/* Kategoriya Taqsimoti Barlari */}
          <div className="glass-effect rounded-2xl p-6 border border-white/10">
            <h3 className="text-sm font-semibold text-white/80 mb-6">Kategoriya taqsimoti</h3>
            <div className="space-y-5">
              {[
                { label: "Jang (Combat)", count: 10212, percent: 80, color: "bg-amber-500" },
                { label: "Cloud", count: 4562, percent: 50, color: "bg-amber-400" },
                { label: "O'zaro ta'sir (Interaction)", count: 2017, percent: 30, color: "bg-yellow-500" },
                { label: "Kechikish (Latency)", count: 787, percent: 15, color: "bg-yellow-400" },
                { label: "Noma'lum", count: 85, percent: 5, color: "bg-zinc-600" },
              ].map((cat) => (
                <div key={cat.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/70 font-medium">{cat.label}</span>
                    <span className="text-white/80 font-bold">{cat.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", cat.color)}
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: Recent Event Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
              <span className="size-2 rounded-full bg-amber-400"></span>So'nggi aniqlash
            </div>
            <div className="flex items-center gap-3">
              <Image src="https://minotar.net/avatar/Knight_King/36.png" alt="Knight_King" width={36} height={36} className="rounded-lg bg-black/40" unoptimized />
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">Knight_King</div>
                <div className="text-xs text-white/40 truncate">Reach · 21/07 23:37</div>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
              <span className="size-2 rounded-full bg-emerald-400"></span>So'nggi cloud aniqlash
            </div>
            <div className="flex items-center gap-3">
              <Image src="https://minotar.net/avatar/Technoblade_005/36.png" alt="Technoblade_005" width={36} height={36} className="rounded-lg bg-black/40" unoptimized />
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">Technoblade_005</div>
                <div className="text-xs text-white/40 truncate">COMBAT_BEHAVIOR · 21/07 23:38</div>
              </div>
            </div>
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
            <div className="flex items-center gap-3">
              <Image src="https://minotar.net/avatar/Felisiya_girls/36.png" alt="Felisiya_girls" width={36} height={36} className="rounded-lg bg-black/40" unoptimized />
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">Felisiya_girls</div>
                <div className="text-xs text-white/40 truncate">Jazo · 21/07 18:29</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Detailed Check Types & Player Distribution (Minestax 1:1) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-effect rounded-2xl p-6 border border-white/10">
            <h3 className="text-sm font-semibold text-white/80 mb-4">Check turi bo'yicha</h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={checkPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                    {checkPieData.map((entry, index) => (
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
                <BarChart data={[
                  { name: "Past", value: 7000, fill: "#22c55e" },
                  { name: "O'rta", value: 1800, fill: "#eab308" },
                  { name: "Yuqori", value: 900, fill: "#f97316" },
                  { name: "Kritik", value: 2100, fill: "#ef4444" },
                ]}>
                  <XAxis dataKey="name" stroke="#ffffff40" />
                  <YAxis stroke="#ffffff40" />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SECTION 6: Shubhalilar Jadvali (Suspects List 1:1) */}
        <div className="glass-effect rounded-2xl border border-white/10 overflow-hidden mb-8">
          <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="size-4 text-amber-400" />
              Shubhalilar
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
            <div className="px-5 py-3 bg-white/[0.02] grid grid-cols-6 text-[10px] font-bold uppercase tracking-wider text-white/40">
              <span className="col-span-2">O'YINCHI</span>
              <span>XAVF</span>
              <span>KATEGORIYA</span>
              <span>HODISALAR</span>
              <span className="text-right">OXIRGI KO'RILGAN</span>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-white/30 text-xs font-bold uppercase tracking-widest">
                Loglar mavjud emas
              </div>
            ) : (
              filteredLogs.slice(0, 15).map((log) => (
                <div key={log.id} className="px-5 py-3.5 grid grid-cols-6 items-center text-xs hover:bg-white/[0.03] transition-colors">
                  <div className="col-span-2 flex items-center gap-3">
                    <Image src={`https://minotar.net/avatar/${log.username}/32.png`} alt={log.username} width={32} height={32} className="rounded-md bg-black/40" unoptimized />
                    <span className="font-bold text-white">{log.username}</span>
                  </div>

                  <div>
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

                  <span className="text-white/60 font-medium">{log.category || "Jang"}</span>
                  <span className="text-white/80 font-bold">{log.violations || 12}</span>
                  <span className="text-right text-white/40 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
      <Footer />
    </main>
  )
}

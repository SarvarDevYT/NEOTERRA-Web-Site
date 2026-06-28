"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Newspaper, Gavel, Users, Activity } from "lucide-react";

interface ServerData {
  online: boolean;
  players?: {
    online: number;
    max: number;
  };
}

export default function AdminDashboardPage() {
  const [newsCount, setNewsCount] = useState<number | string>("...");
  const [rulesCount, setRulesCount] = useState<number | string>("...");
  const [authCount, setAuthCount] = useState<number | string>("...");
  const [serverStatus, setServerStatus] = useState<ServerData | null>(null);

  useEffect(() => {
    // Counts fetching
    async function fetchCounts() {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        setNewsCount(data.news);
        setRulesCount(data.rules);
        setAuthCount(data.auth);
      } catch (e) {
        console.error("Stats fetch error:", e);
      }
    }

    async function fetchServerStatus() {
      try {
        const res = await fetch("https://api.mcsrvstat.us/3/play.neoterra.uz");
        const data = await res.json();
        setServerStatus(data);
      } catch (e) {
        console.error("Server status error:", e);
      }
    }

    fetchCounts();
    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 20000); // 20 sekundda yangilash
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { title: "Yangiliklar", value: newsCount, icon: Newspaper, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Qoidalar", value: rulesCount, icon: Gavel, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { 
      title: "Onlayn", 
      value: serverStatus ? (serverStatus.online ? `${serverStatus.players?.online || 0} / ${serverStatus.players?.max || 0}` : "OFFLINE") : "...", 
      icon: Activity, 
      color: serverStatus?.online ? "text-green-500" : "text-red-500", 
      bg: serverStatus?.online ? "bg-green-500/10" : "bg-red-500/10" 
    },
    { title: "Jami O'yinchilar", value: authCount, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-zinc-800 bg-zinc-900 shadow-lg transition-transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-400">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-zinc-500 mt-1">Real-vaqtdagi ma'lumotlar</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center backdrop-blur-sm">
        <p className="text-zinc-400">
          Xush kelibsiz, Admin! Chap tarafdagi menyu orqali yangiliklar va qoidalarni boshqarishingiz mumkin.
        </p>
      </div>
    </div>
  );
}

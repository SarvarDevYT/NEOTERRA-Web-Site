"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, Gavel, Users, Activity, Bot, CreditCard, ShieldAlert, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { setTelegramWebhookAction } from "@/app/actions/telegram";
import { toggleInpayStatusAction, getSystemSettingsAction } from "@/app/actions/system-settings";

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
  const [totalIncome, setTotalIncome] = useState<number | string>("...");
  const [paymentsCount, setPaymentsCount] = useState<number | string>("...");
  const [serverStatus, setServerStatus] = useState<ServerData | null>(null);
  
  const [inpayEnabled, setInpayEnabled] = useState<boolean>(true);
  const [isTogglingInpay, setIsTogglingInpay] = useState<boolean>(false);

  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setNewsCount(data.news);
      setRulesCount(data.rules);
      setAuthCount(data.auth);
      setTotalIncome(data.totalIncome);
      setPaymentsCount(data.paymentsCount);
      setInpayEnabled(data.inpayEnabled !== false);
    } catch (e) {
      console.error("Stats fetch error:", e);
    }
  };

  const fetchServerStatus = async () => {
    try {
      const res = await fetch("https://api.mcsrvstat.us/3/play.neoterra.uz");
      const data = await res.json();
      setServerStatus(data);
    } catch (e) {
      console.error("Server status error:", e);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleInpay = async () => {
    setIsTogglingInpay(true);
    const newStatus = !inpayEnabled;
    const res = await toggleInpayStatusAction(newStatus);
    if (res.success) {
      setInpayEnabled(newStatus);
    }
    setIsTogglingInpay(false);
  };

  const stats = [
    { title: "Yangiliklar", value: newsCount, icon: Newspaper, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Qoidalar", value: rulesCount, icon: Gavel, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Ro'yxatdan O'tganlar", value: authCount, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { 
      title: "Jami Tushum", 
      value: typeof totalIncome === "number" ? `${totalIncome.toLocaleString()} UZS` : totalIncome, 
      icon: CreditCard, 
      color: "text-amber-400", 
      bg: "bg-amber-500/10",
      subtitle: typeof paymentsCount === "number" ? `${paymentsCount} ta muvaffaqiyatli to'lov` : "Tranzaksiyalar"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <Button 
          onClick={fetchStats}
          variant="outline"
          size="sm"
          className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white flex items-center gap-2"
        >
          <RefreshCw className="size-4" /> Yangilash
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-zinc-800 bg-zinc-900 shadow-lg transition-all hover:border-zinc-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-400">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white truncate">{stat.value}</div>
              <p className="text-xs text-zinc-500 mt-1">{stat.subtitle || "Real-vaqtdagi ma'lumotlar"}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* InPay Payment Maintenance Control */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${inpayEnabled ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              <CreditCard className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-lg">InPay.uz To'lov Tizimi</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                  inpayEnabled 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}>
                  {inpayEnabled ? "● FAOL" : "● VAQTINCHALIK TO'XTATILGAN"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {inpayEnabled 
                  ? "Foydalanuvchilar InPay orqali balansni avtomatik to'ldirishlari mumkin." 
                  : "InPay to'lovlari vaqtinchalik o'chirilgan (Profil sozlamalari va Do'konda avto-to'lov tugmasi bloklanadi)."}
              </p>
            </div>
          </div>

          <Button
            onClick={handleToggleInpay}
            disabled={isTogglingInpay}
            className={`font-bold h-11 px-6 rounded-xl transition-all flex items-center gap-2 text-xs sm:text-sm shrink-0 ${
              inpayEnabled 
                ? "bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30" 
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
            }`}
          >
            {isTogglingInpay ? "O'zgartirilmoqda..." : inpayEnabled ? "Vaqtinchalik To'xtatish (Bloklash)" : "To'lov Tizimini Yoqish"}
          </Button>
        </div>
      </div>

      {/* Telegram Bot Webhook Setup */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#229ED9]/10">
            <Bot className="h-5 w-5 text-[#229ED9]" />
          </div>
          <div>
            <h3 className="text-white font-bold">Telegram Bot Webhook</h3>
            <p className="text-xs text-zinc-500">Bot webhookini sayt manziliga sozlash</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={async () => {
              setIsSettingWebhook(true)
              setWebhookStatus(null)
              try {
                const result = await setTelegramWebhookAction()
                setWebhookStatus(result.success ? `✅ ${result.message}` : `❌ ${result.message}`)
              } catch (err: any) {
                setWebhookStatus(`❌ ${err.message}`)
              } finally {
                setIsSettingWebhook(false)
              }
            }}
            disabled={isSettingWebhook}
            className="bg-[#229ED9] hover:bg-[#1a8abf] text-white font-bold h-10 px-6 rounded-lg flex items-center gap-2"
          >
            <Bot className="h-4 w-4" />
            {isSettingWebhook ? "Sozlanmoqda..." : "Webhookni Sozlash"}
          </Button>
          {webhookStatus && (
            <span className="text-xs text-zinc-400 font-medium">{webhookStatus}</span>
          )}
        </div>
      </div>
    </div>
  );
}

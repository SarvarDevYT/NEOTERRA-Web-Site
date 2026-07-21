"use client";

import { useState } from "react";
import Link from "next/link";
import { Gavel, MessageSquare, Clock, User, ShieldAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { uz, ru, enUS } from "date-fns/locale";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface PenaltyData {
  id: string;
  uuid: string;
  reason: string;
  banned_by_name: string;
  time: string;
  until: string;
  active: boolean;
  username: string;
}

interface BansClientProps {
  initialBans: PenaltyData[];
  initialMutes: PenaltyData[];
  dbError: string | null;
}

export default function BansClient({ initialBans, initialMutes, dbError }: BansClientProps) {
  const { lang, t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"bans" | "mutes">("bans");

  // Pick correct locale for date-fns
  const dateLocale = lang === "ru" ? ru : lang === "en" ? enUS : uz;

  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-32 pb-20 px-4 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {dbError && (
          <div className="max-w-md mx-auto mb-8 p-4 rounded-[2rem] bg-red-950/20 border border-red-500/20 text-red-400 font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 glass-effect backdrop-blur-md">
            <ShieldAlert className="size-4 animate-bounce" />
            <span>
              {lang === "uz"
                ? "Ma'lumotlar bazasiga ulanishda xatolik yuz berdi. Oflayn rejim!"
                : lang === "ru"
                ? "Ошибка подключения к базе данных. Оффлайн режим!"
                : "Database connection error. Offline mode!"}
            </span>
          </div>
        )}

        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter liquid-shadow mb-4">
            {lang === "uz" ? (
              <><span className="text-primary">Jazolar</span> Ro'yxati</>
            ) : lang === "ru" ? (
              <><span className="text-primary">Список</span> Наказаний</>
            ) : (
              <><span className="text-primary">Penalty</span> List</>
            )}
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto font-medium">
            {lang === "uz"
              ? "Server qoidalarini buzgan o'yinchilarga nisbatan qo'llanilgan so'nggi jazo choralari."
              : lang === "ru"
              ? "Последние меры наказания, примененные к игрокам за нарушение правил."
              : "Latest penalties applied to players for violating server rules."}
          </p>
        </header>

        {/* Navigation Sub-Tabs (Bans | Anticheat | Mutes) */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2 p-1.5 glass-effect rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab("bans")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-wider",
                activeTab === "bans"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/30"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Gavel className="size-4" />
              {lang === "uz" ? "BANLAR" : lang === "ru" ? "БАНЫ" : "BANS"} ({initialBans.length})
            </button>

            <Link
              href="/anticheat"
              className="px-6 py-2.5 rounded-xl text-xs font-black transition-all text-white/50 hover:text-white hover:bg-white/5 flex items-center gap-2 uppercase tracking-wider"
            >
              <ShieldAlert className="size-4" />
              ANTICHEAT
            </Link>

            <button
              onClick={() => setActiveTab("mutes")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-wider",
                activeTab === "mutes"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/30"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <MessageSquare className="size-4" />
              {lang === "uz" ? "MUTELAR" : lang === "ru" ? "МУТЫ" : "MUTES"} ({initialMutes.length})
            </button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "bans" | "mutes")} className="w-full">
          <TabsContent value="bans" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4">
              {initialBans.length === 0 ? (
                <div className="py-20 text-center text-zinc-600 font-bold uppercase tracking-widest">
                  {lang === "uz" ? "Hozircha banlar yo'q" : lang === "ru" ? "Банов пока нет" : "No bans yet"}
                </div>
              ) : (
                initialBans.map((ban) => (
                  <BanCard key={ban.id} data={ban} type="BAN" locale={dateLocale} lang={lang} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="mutes" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4">
              {initialMutes.length === 0 ? (
                <div className="py-20 text-center text-zinc-600 font-bold uppercase tracking-widest">
                  {lang === "uz"
                    ? "Hozircha muzlatilganlar yo'q"
                    : lang === "ru"
                    ? "Мутов пока нет"
                    : "No mutes yet"}
                </div>
              ) : (
                initialMutes.map((mute) => (
                  <BanCard key={mute.id} data={mute} type="MUTE" locale={dateLocale} lang={lang} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function BanCard({ data, type, locale, lang }: { data: PenaltyData; type: "BAN" | "MUTE"; locale: any; lang: string }) {
  const time = new Date(Number(data.time));
  const until = Number(data.until);
  const isPermanent = until === -1;

  return (
    <div className="glass-effect border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/30 transition-colors group">
      <div className="flex items-center gap-6 w-full md:w-auto">
        <div
          className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${
            type === "BAN" ? "bg-red-500/10 text-red-500" : "bg-orange-500/10 text-orange-500"
          }`}
        >
          <ShieldAlert className="size-6" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-bold text-white uppercase italic">{data.username || "Player"}</h3>
            {!data.active && (
              <span className="text-[10px] font-black uppercase bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full border border-green-500/10">
                {lang === "uz" ? "Ozod qilingan" : lang === "ru" ? "Разбанен" : "Unbanned"}
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 font-medium line-clamp-1">
            {lang === "uz" ? "Sabab" : lang === "ru" ? "Причина" : "Reason"}:{" "}
            <span className="text-zinc-300">"{data.reason}"</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 font-bold uppercase tracking-wide w-full md:w-auto justify-between md:justify-end">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          <span>{formatDistanceToNow(time, { addSuffix: true, locale })}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="size-4 text-primary" />
          <span>By: {data.banned_by_name}</span>
        </div>
        <div
          className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${
            isPermanent ? "bg-red-600 text-white" : "bg-primary/20 text-primary border border-primary/20"
          }`}
        >
          {isPermanent
            ? lang === "uz"
              ? "MUDDATSIZ"
              : lang === "ru"
              ? "НАВСЕГДА"
              : "PERMANENT"
            : lang === "uz"
            ? "VAQTINCHALIK"
            : lang === "ru"
            ? "ВРЕМЕННО"
            : "TEMPORARY"}
        </div>
      </div>
    </div>
  );
}

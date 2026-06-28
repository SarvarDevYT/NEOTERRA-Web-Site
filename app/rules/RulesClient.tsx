"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Gavel, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";

interface Rule {
  id: string;
  title: string;
  title_ru?: string;
  title_en?: string;
  description: string;
  description_ru?: string;
  description_en?: string;
  order: number;
}

interface RulesClientProps {
  initialRules: Rule[];
  displayDate: string;
}

export default function RulesClient({ initialRules, displayDate }: RulesClientProps) {
  const { lang, t } = useTranslation();

  return (
    <main className="min-h-screen bg-zinc-950 py-32 px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <header className="text-center mb-20">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400 mb-8 border border-white/10 backdrop-blur-xl shadow-2xl">
            <Gavel className="h-10 w-10" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-6 liquid-shadow">
            {lang === "uz" ? (
              <>SERVER <span className="text-purple-500">QOIDALARI</span></>
            ) : lang === "ru" ? (
              <>ПРАВИЛА <span className="text-purple-500">СЕРВЕРА</span></>
            ) : (
              <>SERVER <span className="text-purple-500">RULES</span></>
            )}
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-lg">
            {t("rules", "subtitle")}
          </p>
        </header>

        <div className="space-y-8">
          {initialRules.length === 0 ? (
            <div className="text-center p-20 rounded-[2.5rem] border border-dashed border-white/10 bg-white/5 backdrop-blur-sm">
              <AlertCircle className="h-12 w-12 text-zinc-700 mx-auto mb-6" />
              <p className="text-zinc-500 text-xl italic">{t("rules", "noRules")}</p>
            </div>
          ) : (
            initialRules.map((rule) => {
              const displayTitle = lang === "ru" && rule.title_ru ? rule.title_ru : (lang === "en" && rule.title_en ? rule.title_en : rule.title);
              const displayDescription = lang === "ru" && rule.description_ru ? rule.description_ru : (lang === "en" && rule.description_en ? rule.description_en : rule.description);
              
              return (
                <div
                  key={rule.id}
                  className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/[0.08] hover:border-purple-500/30 hover:scale-[1.01] shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex gap-8 items-start relative z-10">
                    <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800 text-white font-black text-2xl shadow-lg shadow-purple-500/20">
                      {rule.order || "!"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-black text-white mb-4 group-hover:text-purple-400 transition-colors uppercase tracking-tight">
                        {displayTitle}
                      </h3>
                      <div className="text-zinc-400 leading-relaxed whitespace-pre-wrap break-all text-base font-medium">
                        {displayDescription}
                      </div>
                    </div>
                    <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <Sparkles className="h-6 w-6 text-purple-500 shadow-glow" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <footer className="mt-24 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-500 italic mb-4">
                <ShieldCheck className="h-4 w-4 text-purple-500" />
                {lang === "uz"
                  ? "NeoTerra ma'muriyati qoidalarni istalgan vaqtda o'zgartirish huquqini saqlaydi."
                  : lang === "ru"
                  ? "Администрация NeoTerra оставляет за собой право изменять правила в любое время."
                  : "NeoTerra administration reserves the right to change rules at any time."
                }
            </div>
            <p className="text-zinc-700 text-[10px] uppercase tracking-[0.2em] font-bold">
                {lang === "uz" ? "So'nggi yangilanish" : lang === "ru" ? "Последнее обновление" : "Last updated"}: {displayDate}
            </p>
        </footer>
      </div>
    </main>
  );
}

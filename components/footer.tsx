"use client";

import { Instagram, Youtube, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

export function Footer() {
  const { lang, t } = useTranslation();

  return (
    <footer className="glass-effect border-t border-white/5 mt-20 py-12 rounded-t-[3rem]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tighter text-white">
                NEO<span className="text-primary">TERRA</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lang === "uz" ? (
                "O'zbekistondagi eng innovatsion Minecraft serveri. Biz bilan sarguzashtlaringizni boshlang!"
              ) : lang === "ru" ? (
                "Самый инновационный Minecraft сервер в Узбекистане. Начните свое приключение с нами!"
              ) : (
                "The most innovative Minecraft server in Uzbekistan. Start your adventure with us!"
              )}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs text-primary">
              {t("footer", "links")}
            </h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">
                {lang === "uz" ? "Bosh sahifa" : lang === "ru" ? "Главная" : "Home"}
              </Link>
              <Link href="/shop" className="hover:text-primary transition-colors">
                {lang === "uz" ? "Do'kon" : lang === "ru" ? "Магазин" : "Store"}
              </Link>
              <Link href="/rules" className="hover:text-primary transition-colors">
                {lang === "uz" ? "Qoidalar" : lang === "ru" ? "Правила" : "Rules"}
              </Link>
              <Link href="/help" className="hover:text-primary transition-colors">
                {lang === "uz" ? "Yordam" : lang === "ru" ? "Помощь" : "Help"}
              </Link>
              <Link href="/social" className="hover:text-primary transition-colors">
                {lang === "uz" ? "Ijtimoiy tarmoqlar" : lang === "ru" ? "Социальные сети" : "Social networks"}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs text-primary">
              {lang === "uz" ? "Biz bilan ulaning" : lang === "ru" ? "Связаться с нами" : "Connect with us"}
            </h4>
            <div className="flex gap-4">
              <Link
                href="https://t.me/NeoTerraServer"
                className="size-10 flex items-center justify-center rounded-xl bg-secondary/50 border border-white/5 hover:border-primary/50 text-white transition-all"
              >
                <MessageSquare className="size-5" />
              </Link>
              <Link
                href="https://neoterra-soon.netlify.app"
                className="size-10 flex items-center justify-center rounded-xl bg-secondary/50 border border-white/5 hover:border-primary/50 text-white transition-all"
              >
                <Instagram className="size-5" />
              </Link>
              <Link
                href="https://www.youtube.com/@NeoTerraMC"
                className="size-10 flex items-center justify-center rounded-xl bg-secondary/50 border border-white/5 hover:border-primary/50 text-white transition-all"
              >
                <Youtube className="size-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-medium uppercase tracking-widest">
          <p>© 2026 PLAY.NEOTERRA.UZ. {t("footer", "rights")}</p>
          <p>
            {lang === "uz"
              ? "Mojang AB bilan aloqador emas."
              : lang === "ru"
              ? "Не связано с Mojang AB."
              : "Not affiliated with Mojang AB."}
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { Instagram, Youtube, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

export function Footer() {
  const { t } = useTranslation();

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
              {t("footer", "about")}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs text-primary">
              {t("footer", "links")}
            </h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">
                {t("footer", "home")}
              </Link>
              <Link href="/shop" className="hover:text-primary transition-colors">
                {t("footer", "shop")}
              </Link>
              <Link href="/rules" className="hover:text-primary transition-colors">
                {t("footer", "rules")}
              </Link>
              <Link href="/help" className="hover:text-primary transition-colors">
                {t("footer", "help")}
              </Link>
              <Link href="/social" className="hover:text-primary transition-colors">
                {t("footer", "social")}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs text-primary">
              {t("footer", "connect")}
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
          <p>{t("footer", "notAffiliated")}</p>
        </div>
      </div>
    </footer>
  );
}

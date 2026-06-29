"use client";

import { useTranslation } from "@/hooks/use-translation";

export function WelcomeSection() {
  const { lang } = useTranslation();

  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-4 liquid-shadow">
        {lang === "uz" ? "XUSH KELIBSIZ!" : lang === "ru" ? "ДОБРО ПОЖАЛОВАТЬ!" : "WELCOME!"}
      </h2>
      <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
        {lang === "uz" ? (
          "NeoTerra serverining rasmiy do'koniga xush kelibsiz. Eng yaxshi buyumlar va ranklarni topish uchun do'kon bo'limiga o'ting."
        ) : lang === "ru" ? (
          "Добро пожаловать в официальный магазин сервера NeoTerra. Перейдите в раздел магазина, чтобы найти лучшие товары и привилегии."
        ) : (
          "Welcome to the official NeoTerra server store. Head over to the store section to find the best items and ranks."
        )}
      </p>
    </section>
  );
}

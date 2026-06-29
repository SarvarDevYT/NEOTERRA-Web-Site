"use client";

import React, { useState } from "react";
import { Footer } from "@/components/footer";
import { useTranslation } from "@/hooks/use-translation";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQPage() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = [
    {
      q: t("faq", "q1"),
      a: t("faq", "a1"),
    },
    {
      q: t("faq", "q2"),
      a: t("faq", "a2"),
    },
    {
      q: t("faq", "q3"),
      a: t("faq", "a3"),
    },
    {
      q: t("faq", "q4"),
      a: t("faq", "a4"),
    },
  ];

  return (
    <main className="min-h-screen bg-background pt-32 relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -z-10" />

      <section className="container mx-auto px-4 py-20">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <HelpCircle className="size-3.5" /> FAQ
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-6 liquid-shadow">
            {t("faq", "title")}
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto font-medium">
            {t("faq", "subtitle")}
          </p>
          <div className="h-px w-24 bg-primary mx-auto mt-8 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
        </header>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="glass-effect rounded-[2rem] border border-white/5 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-lg md:text-xl font-bold text-white pr-4">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`size-5 text-primary shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="px-8 pb-6 text-sm md:text-base text-zinc-400 font-medium leading-relaxed border-t border-white/5 pt-4">
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <Footer />
    </main>
  );
}

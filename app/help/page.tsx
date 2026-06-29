"use client";

import Link from "next/link";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, HelpCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function HelpPage() {
  const { lang, t } = useTranslation();

  return (
    <main className="min-h-screen bg-background pt-32">
      <section className="container mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-16 text-center liquid-shadow">
          {lang === "uz" ? (
            <>YORDAM <span className="text-primary">MARKAZI</span></>
          ) : lang === "ru" ? (
            <>ЦЕНТР <span className="text-primary">ПОМОЩИ</span></>
          ) : (
            <>SUPPORT <span className="text-primary">CENTER</span></>
          )}
        </h1>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="glass-effect p-10 rounded-[2.5rem] text-center flex flex-col items-center hover:bg-white/[0.08] transition-all duration-500">
            <div className="size-20 glass-effect rounded-3xl flex items-center justify-center mb-6 liquid-shadow">
              <MessageCircle className="size-10 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4 uppercase italic">Telegram</h3>
            <p className="text-white/60 mb-8 text-sm font-medium leading-relaxed">
              {lang === "uz"
                ? "Har qanday savollar bo'yicha bizning Telegram adminlarimizga murojaat qiling."
                : lang === "ru"
                ? "По любым вопросам обращайтесь к нашим администраторам в Telegram."
                : "For any questions or issues, please contact our Telegram administrators."}
            </p>
            <Button
              asChild
              className="w-full bg-white text-black hover:bg-white/90 font-black rounded-2xl py-6"
            >
              <a
                href="https://t.me/NeoTerraAdmin"
                target="_blank"
                rel="noopener noreferrer"
              >
                {lang === "uz" ? "BOG'LANISH" : lang === "ru" ? "СВЯЗАТЬСЯ" : "CONTACT US"}
              </a>
            </Button>
          </div>

          <div className="glass-effect p-10 rounded-[2.5rem] text-center flex flex-col items-center hover:bg-white/[0.08] transition-all duration-500 scale-105 shadow-2xl">
            <div className="size-20 glass-effect rounded-3xl flex items-center justify-center mb-6 liquid-shadow">
              <Mail className="size-10 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4 uppercase italic">Email</h3>
            <p className="text-white/60 mb-8 text-sm font-medium leading-relaxed">
              {lang === "uz"
                ? "Rasmiy takliflar va shikoyatlar uchun bizga email orqali yozing."
                : lang === "ru"
                ? "Для официальных предложений и жалоб пишите нам на почту."
                : "For official business inquiries and complaints, email us."}
            </p>
            <Button
              asChild
              className="w-full bg-primary text-white hover:bg-primary/80 font-black rounded-2xl py-6"
            >
              <a href="mailto:neoterramc@gmail.com">
                {lang === "uz" ? "XAT YOZISH" : lang === "ru" ? "НАПИСАТЬ" : "SEND EMAIL"}
              </a>
            </Button>
          </div>

          <div className="glass-effect p-10 rounded-[2.5rem] text-center flex flex-col items-center hover:bg-white/[0.08] transition-all duration-500">
            <div className="size-20 glass-effect rounded-3xl flex items-center justify-center mb-6 liquid-shadow">
              <HelpCircle className="size-10 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4 uppercase italic">FAQ</h3>
            <p className="text-white/60 mb-8 text-sm font-medium leading-relaxed">
              {lang === "uz"
                ? "Ko'p beriladigan savollarga javoblarni toping."
                : lang === "ru"
                ? "Найдите ответы на часто задаваемые вопросы."
                : "Find answers to frequently asked questions."}
            </p>
            <Button
              asChild
              className="w-full bg-white/5 hover:bg-white/10 text-white font-black border border-white/10 rounded-2xl py-6"
            >
              <Link href="https://neoterra-soon.netlify.app">
                {lang === "uz" ? "O'QISH" : lang === "ru" ? "ЧИТАТЬ" : "READ FAQ"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

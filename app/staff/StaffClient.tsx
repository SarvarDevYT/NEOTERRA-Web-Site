"use client";

import { useTranslation } from "@/hooks/use-translation";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StaffMember {
  id: string;
  nickname: string;
  role: string;
  role_ru?: string;
  role_en?: string;
  discord?: string;
  telegram?: string;
  imageUrl?: string;
}

interface StaffClientProps {
  initialStaff: StaffMember[];
}

export default function StaffClient({ initialStaff }: StaffClientProps) {
  const { lang, t } = useTranslation();

  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-32 pb-20 px-4 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter liquid-shadow mb-4">
            {lang === "uz" ? (
              <>Bizning <span className="text-primary">Jamoa</span></>
            ) : lang === "ru" ? (
              <>Наша <span className="text-primary">Команда</span></>
            ) : (
              <>Our <span className="text-primary">Team</span></>
            )}
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto font-medium">
            {t("staff", "subtitle")}
          </p>
          <div className="h-px w-24 bg-primary mx-auto mt-8 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
        </header>

        {initialStaff.length === 0 ? (
          <div className="py-20 text-center text-zinc-600 font-black uppercase tracking-[0.3em] bg-white/5 rounded-3xl border border-white/5 italic">
            {t("staff", "noStaff")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {initialStaff.map((member) => {
              const displayRole = lang === "ru" && member.role_ru ? member.role_ru : (lang === "en" && member.role_en ? member.role_en : member.role);
              return (
                <div 
                  key={member.id}
                  className="group relative"
                >
                  {/* Card Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-transparent rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative glass-effect rounded-[2.5rem] p-8 border border-white/10 flex flex-col items-center text-center transition-all duration-300 group-hover:-translate-y-2 z-10">
                     {/* Avatar */}
                     <div className="relative w-32 h-32 mb-6 group-hover:scale-110 transition-transform duration-500">
                       <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                       <div className="relative w-full h-full rounded-full border-2 border-primary/30 overflow-hidden bg-zinc-900 flex items-center justify-center p-2">
                          <img 
                            src={member.imageUrl || `https://mc-heads.net/avatar/${member.nickname}/100`} 
                            alt={member.nickname}
                            className="w-full h-full rounded-full object-contain"
                          />
                       </div>
                     </div>

                     <h3 className="text-2xl font-black text-white italic tracking-tighter mb-1">
                       {member.nickname}
                     </h3>
                     <span className="text-primary font-black uppercase text-xs tracking-[0.2em] mb-6">
                       {displayRole}
                     </span>

                     <div className="w-full h-px bg-white/5 mb-6" />

                     <div className="flex gap-4 w-full mt-auto">
                       {member.discord ? (
                         <a 
                           href={member.discord} 
                           target="_blank" 
                           rel="noreferrer" 
                           className="flex-1"
                         >
                           <Button 
                             variant="ghost" 
                             className="w-full bg-white/5 hover:bg-white/10 border border-white/10 h-12 rounded-2xl group/btn"
                           >
                             <MessageSquare className="size-5 text-indigo-400 group-hover/btn:scale-110 transition-transform" />
                           </Button>
                         </a>
                       ) : (
                          <div className="flex-1 opacity-20 pointer-events-none">
                            <Button variant="ghost" className="w-full bg-white/5 border border-white/10 h-12 rounded-2xl">
                               <MessageSquare className="size-5 text-zinc-500" />
                            </Button>
                          </div>
                       )}

                       {member.telegram ? (
                         <a 
                           href={member.telegram} 
                           target="_blank" 
                           rel="noreferrer" 
                           className="flex-1"
                         >
                           <Button 
                             variant="ghost" 
                             className="w-full bg-white/5 hover:bg-white/10 border border-white/10 h-12 rounded-2xl group/btn"
                           >
                             <Send className="size-5 text-sky-400 group-hover/btn:scale-110 transition-transform" />
                           </Button>
                         </a>
                       ) : (
                         <div className="flex-1 opacity-20 pointer-events-none">
                            <Button variant="ghost" className="w-full bg-white/5 border border-white/10 h-12 rounded-2xl">
                               <Send className="size-5 text-zinc-500" />
                            </Button>
                          </div>
                       )}
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

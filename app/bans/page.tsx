import { Metadata } from "next";
import { getBansAction, getMutesAction, getPlayerNameAction } from "@/app/actions/litebans";
import { Gavel, MessageSquare, Clock, User, ShieldAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";

export const metadata: Metadata = {
  title: "Jazolar Ro'yxati - NeoTerra",
  description: "NeoTerra serveridagi barcha faol va o'tmishdagi jazolarni ko'ring.",
};

export const dynamic = "force-dynamic";

export default async function BansPage() {
  const bansRes = await getBansAction();
  const mutesRes = await getMutesAction();

  const bans = bansRes.success ? bansRes.data : [];
  const mutes = mutesRes.success ? mutesRes.data : [];
  const dbError = bansRes.error || mutesRes.error;

  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-32 pb-20 px-4 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {dbError && (
          <div className="max-w-md mx-auto mb-8 p-4 rounded-[2rem] bg-red-950/20 border border-red-500/20 text-red-400 font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 glass-effect backdrop-blur-md">
            <ShieldAlert className="size-4 animate-bounce" />
            <span>Ma'lumotlar bazasiga ulanishda xatolik yuz berdi. Offline rejim!</span>
          </div>
        )}

        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter liquid-shadow mb-4">
            <span className="text-primary">Jazolar</span> Ro'yxati
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto font-medium">
            Server qoidalarini buzgan o'yinchilarga nisbatan qo'llanilgan so'nggi jazo choralari.
          </p>
        </header>

        <Tabs defaultValue="bans" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl h-14 p-1 mb-12">
            <TabsTrigger 
              value="bans" 
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase tracking-widest italic"
            >
              <Gavel className="size-4 mr-2" /> Banlar
            </TabsTrigger>
            <TabsTrigger 
              value="mutes" 
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase tracking-widest italic"
            >
              <MessageSquare className="size-4 mr-2" /> Mutes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bans" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4">
               {bans.length === 0 ? (
                 <div className="py-20 text-center text-zinc-600 font-bold uppercase tracking-widest">
                   Hozircha banlar yo'q
                 </div>
               ) : (
                 bans.map((ban: any) => (
                   <BanCard key={ban.id} data={ban} type="BAN" />
                 ))
               )}
            </div>
          </TabsContent>

          <TabsContent value="mutes" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4">
              {mutes.length === 0 ? (
                <div className="py-20 text-center text-zinc-600 font-bold uppercase tracking-widest">
                  Hozircha muzlatilganlar yo'q
                </div>
              ) : (
                mutes.map((mute: any) => (
                  <BanCard key={mute.id} data={mute} type="MUTE" />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

async function BanCard({ data, type }: { data: any, type: 'BAN' | 'MUTE' }) {
  const username = await getPlayerNameAction(data.uuid);
  const time = new Date(Number(data.time));
  const until = Number(data.until);
  const isPermanent = until === -1;

  return (
    <div className="glass-effect border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/30 transition-colors group">
      <div className="flex items-center gap-6 w-full md:w-auto">
        <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${type === 'BAN' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
           <ShieldAlert className="size-6" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-bold text-white uppercase italic">{username}</h3>
            {!data.active && (
               <span className="text-[10px] font-black uppercase bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full border border-green-500/10">
                 Ozod qilingan
               </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 font-medium line-clamp-1">
            Sabab: <span className="text-zinc-300">"{data.reason}"</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 font-bold uppercase tracking-wide w-full md:w-auto justify-between md:justify-end">
        <div className="flex items-center gap-2">
           <Clock className="size-4 text-primary" />
           <span>{formatDistanceToNow(time, { addSuffix: true, locale: uz })}</span>
        </div>
        <div className="flex items-center gap-2">
           <User className="size-4 text-primary" />
           <span>By: {data.banned_by_name}</span>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${isPermanent ? 'bg-red-600 text-white' : 'bg-primary/20 text-primary border border-primary/20'}`}>
           {isPermanent ? "MUDDATSIZ" : "VAQTINCHALIK"}
        </div>
      </div>
    </div>
  );
}

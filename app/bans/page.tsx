"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShieldAlert, Gavel, FileText, Send, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getBanAppealsAction, submitBanAppealAction, BanAppeal } from "@/app/actions/bans";

export default function BansPage() {
  const { user, profile } = useAuth();
  const [appeals, setAppeals] = useState<BanAppeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAppeals();
  }, []);

  async function fetchAppeals() {
    setIsLoading(true);
    const data = await getBanAppealsAction();
    setAppeals(data);
    setIsLoading(false);
  }

  async function handleSubmitAppeal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const username = String(formData.get("username") ?? "").trim();
    const reason = String(formData.get("reason") ?? "").trim();
    const appealText = String(formData.get("appealText") ?? "").trim();

    const res = await submitBanAppealAction(username, reason, appealText, user?.uid);
    if (res.success) {
      toast.success(res.message);
      setIsDialogOpen(false);
      fetchAppeals();
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-black text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="container max-w-5xl mx-auto px-4 relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-widest mb-2">
              <Gavel className="h-4 w-4" /> SERVER JAZOLARI VA APELLATSIYA
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter liquid-shadow">
              BANLAR VA <span className="text-red-500">APELLATSIYALAR</span>
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl mt-1">
              Noto&apos;g&apos;ri ban olgan deb hisoblasangiz, apellyatsiya shaklini to&apos;ldiring. Adminlar arizangizni tekshirib chiqishadi.
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 font-black tracking-wider uppercase italic h-12 px-6 rounded-2xl gap-2 shadow-lg shadow-red-950/50">
                <FileText className="h-4 w-4" /> Ban Apellyatsiyasi Yuborish
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-white/10 bg-zinc-950/95 backdrop-blur-2xl rounded-[2.5rem] text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-white uppercase italic flex items-center gap-2">
                  <ShieldAlert className="h-6 w-6 text-red-500" /> UNBAN ARIZASI YUBORISH
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmitAppeal} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Minecraft Nikingiz</Label>
                  <Input
                    name="username"
                    defaultValue={profile?.minecraftUsername || ""}
                    placeholder="Masalan: Steve"
                    required
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Ban Sababi (Aktiv jazodagi sabab)</Label>
                  <Input
                    name="reason"
                    placeholder="Masalan: Cheating / GrimAC / AutoClicker"
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Nega Unban Berishimiz Kerak? (Tushuntirish)</Label>
                  <Textarea
                    name="appealText"
                    placeholder="Batafsil tushuntiring..."
                    required
                    rows={4}
                    className="border-white/10 bg-white/5 rounded-2xl text-white font-medium p-3"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-red-600 hover:bg-red-700 font-black tracking-widest italic rounded-2xl gap-2">
                  <Send className="h-4 w-4" /> {isSubmitting ? "YUBORILMOQDA..." : "ARIZANI YUBORISH"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Appeals History List */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-black text-white italic uppercase tracking-wider">So'nggi Apellyatsiyalar Ro'yxati</h2>

          {isLoading ? (
            <div className="text-center py-20 text-white/50 font-bold animate-pulse">Yuklanmoqda...</div>
          ) : appeals.length === 0 ? (
            <Card className="border-white/5 bg-zinc-900/40 rounded-3xl p-10 text-center">
              <Gavel className="h-10 w-10 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 font-bold">Hozircha apellyatsiyalar mavjud emas</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {appeals.map((appeal) => (
                <Card key={appeal.id} className="border-white/5 bg-zinc-900/50 rounded-2xl hover:border-red-500/20 transition-all">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-black text-lg">{appeal.username}</h3>
                        <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                          appeal.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                          appeal.status === "rejected" ? "bg-red-500/10 text-red-400 border-red-500/30" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}>
                          {appeal.status === "approved" && <CheckCircle2 className="h-3 w-3" />}
                          {appeal.status === "rejected" && <XCircle className="h-3 w-3" />}
                          {appeal.status === "pending" && <Clock className="h-3 w-3" />}
                          {appeal.status === "approved" ? "TASDIQLANDI (UNBAN)" : appeal.status === "rejected" ? "RAD ETILDI" : "KO'RIB CHIQILMOQDA"}
                        </span>
                      </div>
                      {appeal.reason && (
                        <p className="text-xs text-red-400/80 font-mono">Ban sababi: {appeal.reason}</p>
                      )}
                      <p className="text-xs text-zinc-400 italic font-medium pt-1">&quot;{appeal.appealText}&quot;</p>
                    </div>

                    <div className="text-xs text-zinc-500 self-end md:self-center shrink-0">
                      {appeal.createdAt ? new Date(appeal.createdAt).toLocaleDateString() : ""}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

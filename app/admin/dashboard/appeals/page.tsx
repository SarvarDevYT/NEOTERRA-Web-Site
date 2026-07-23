"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, RefreshCw, Gavel, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { getBanAppealsAction, updateAppealStatusAction, BanAppeal } from "@/app/actions/bans";

export default function AdminAppealsPage() {
  const [appeals, setAppeals] = useState<BanAppeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppeals();
  }, []);

  async function fetchAppeals() {
    setIsLoading(true);
    const data = await getBanAppealsAction();
    setAppeals(data);
    setIsLoading(false);
  }

  async function handleStatusUpdate(id: string, status: "approved" | "rejected") {
    const actionText = status === "approved" ? "tasdiqlab, o'yinchini unban qilmoqchimisiz?" : "rad etmoqchimisiz?";
    if (!confirm(`Ushbu arizani ${actionText}`)) return;

    const res = await updateAppealStatusAction(id, status);
    if (res.success) {
      toast.success(res.message);
      fetchAppeals();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Ban Apellyatsiyalari Boshqaruvi
          </h1>
          <p className="text-zinc-400">O&apos;yinchilar yuborgan unban so&apos;rovlarini ko&apos;rib chiqing va bir bosishda unban bering.</p>
        </div>

        <Button
          onClick={fetchAppeals}
          disabled={isLoading}
          variant="outline"
          className="border-white/10 text-white hover:bg-white/5 font-bold gap-2 rounded-xl"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Yangilash
        </Button>
      </div>

      {/* Appeals List */}
      {isLoading ? (
        <div className="text-center py-20 text-white/50 font-bold animate-pulse">Yuklanmoqda...</div>
      ) : appeals.length === 0 ? (
        <Card className="border-white/5 bg-zinc-900/50 rounded-2xl">
          <CardContent className="text-center py-16">
            <Gavel className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-bold">Hozircha ko&apos;rib chiqilmagan arizalar mavjud emas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {appeals.map((appeal) => (
            <Card key={appeal.id} className="border-white/5 bg-zinc-900/50 rounded-2xl hover:border-purple-500/20 transition-all">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-black text-xl">{appeal.username}</h3>
                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                      appeal.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                      appeal.status === "rejected" ? "bg-red-500/10 text-red-400 border-red-500/30" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}>
                      {appeal.status === "approved" && <CheckCircle2 className="h-3 w-3" />}
                      {appeal.status === "rejected" && <XCircle className="h-3 w-3" />}
                      {appeal.status === "pending" && <Clock className="h-3 w-3" />}
                      {appeal.status === "approved" ? "TASDIQLANGAN (UNBAN)" : appeal.status === "rejected" ? "RAD ETILGAN" : "KUTILMOQDA"}
                    </span>
                  </div>

                  {appeal.reason && (
                    <div className="text-xs text-red-400 font-mono font-bold bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20 inline-block">
                      Ban sababi: {appeal.reason}
                    </div>
                  )}

                  <p className="text-sm text-zinc-300 bg-white/5 p-3 rounded-xl border border-white/5 italic">
                    &quot;{appeal.appealText}&quot;
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  {appeal.status === "pending" ? (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate(appeal.id, "approved")}
                        className="bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl gap-1 text-xs h-11 px-4"
                      >
                        <Check className="h-4 w-4" /> Tasdiqlash (Unban)
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(appeal.id, "rejected")}
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white font-bold rounded-xl gap-1 text-xs h-11 px-4"
                      >
                        <X className="h-4 w-4" /> Rad Etish
                      </Button>
                    </>
                  ) : (
                    <div className="text-xs text-zinc-500 font-bold">
                      Ishlab chiqilgan
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

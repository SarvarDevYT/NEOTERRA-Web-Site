"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dices, Sparkles, AlertCircle, Clock, ShieldCheck, Gamepad2, Gift } from "lucide-react";
import { toast } from "sonner";
import { getWheelRewardsAction, spinWheelAction, WheelReward } from "@/app/actions/wheel";
import Link from "next/link";
import { Footer } from "@/components/footer";

export default function WheelPage() {
  const { uid, minecraftUsername } = useAuth();
  const [rewards, setRewards] = useState<WheelReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [wonReward, setWonReward] = useState<WheelReward | null>(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  async function fetchRewards() {
    setIsLoading(true);
    const data = await getWheelRewardsAction();
    setRewards(data);
    setIsLoading(false);
  }

  async function handleSpin() {
    if (!uid) {
      toast.error("Omad g'ildiragini aylantirish uchun avval tizimga kiring!");
      return;
    }
    if (!minecraftUsername) {
      toast.error("Avval profilizda Minecraft akkauntingizni (/link) bog'lang!");
      return;
    }
    if (isSpinning) return;
    if (rewards.length === 0) {
      toast.error("G'ildirak mukofotlari mavjud emas!");
      return;
    }

    setIsSpinning(true);
    setWonReward(null);

    const res = await spinWheelAction(uid);

    if (!res.success) {
      toast.error(res.message);
      setIsSpinning(false);
      return;
    }

    const winIdx = res.rewardIndex !== undefined && res.rewardIndex >= 0 ? res.rewardIndex : 0;
    const reward = res.reward || rewards[winIdx];

    // Trigonometric rotation computation
    const numSlices = rewards.length;
    const sliceAngle = 360 / numSlices;
    
    // Slice winIdx center is at: winIdx * sliceAngle + sliceAngle / 2
    const targetSliceCenter = winIdx * sliceAngle + sliceAngle / 2;
    const rotationDelta = (360 - targetSliceCenter) % 360;

    // 5 full rotations (1800 deg) + exact offset
    const currentModulo = rotationDegree % 360;
    const totalRotation = rotationDegree + 1800 + ((rotationDelta - currentModulo + 360) % 360);

    setRotationDegree(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonReward(reward);
      if (reward.type === "nothing") {
        toast.info("Afsus, bu safar omadingiz kelmadi!");
      } else {
        toast.success(`TABRIKLAYMIZ! Siz "${reward.name}" yutib oldingiz! 🎉`);
      }
    }, 4500);
  }

  return (
    <div className="flex flex-col min-h-screen bg-black justify-between text-white relative overflow-hidden">
      <main className="flex-1 pt-24 pb-12 flex flex-col items-center justify-center">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-widest mb-3">
            <Sparkles className="h-4 w-4" /> KUNLIK BEPUL OMAD G'ILDIRAGI
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter liquid-shadow">
            HAR KUNI <span className="text-purple-500">AYLANTIR VA YUT!</span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto mt-2">
            Har 24 soatda 1 marta bepul aylantiring. Donat ranklar, sayt balansi va maxsus sovg&apos;alarni qo&apos;lga kiriting!
          </p>
        </div>

        {!uid ? (
          <Card className="border-purple-500/30 bg-purple-500/5 max-w-md mx-auto rounded-3xl p-6 text-center">
            <ShieldCheck className="h-10 w-10 text-purple-400 mx-auto mb-2" />
            <h3 className="text-white font-black text-lg">TIZIMGA KIRISh TALAB ETILADI</h3>
            <p className="text-zinc-400 text-xs mt-1 mb-4">G&apos;ildirakni aylantirish uchun hisobingizga kiring.</p>
            <Button asChild className="w-full h-12 bg-purple-600 hover:bg-purple-700 font-bold rounded-2xl">
              <Link href="/auth">Kirish / Ro&apos;yxatdan o&apos;tish</Link>
            </Button>
          </Card>
        ) : !minecraftUsername ? (
          <Card className="border-amber-500/30 bg-amber-500/5 max-w-md mx-auto rounded-3xl p-6 text-center">
            <Gamepad2 className="h-10 w-10 text-amber-400 mx-auto mb-2" />
            <h3 className="text-white font-black text-lg">MINECRAFT AKKAUNTINGIZNI BOG'LANG</h3>
            <p className="text-zinc-400 text-xs mt-1 mb-4">Mukofot in-game berilishi uchun o&apos;yin nikingizni ulashingiz shart.</p>
            <Button asChild className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-2xl">
              <Link href="/settings">Akkauntni Bog&apos;lash (/link)</Link>
            </Button>
          </Card>
        ) : null}

        {/* SVG Wheel Graphic Container */}
        <div className="relative w-[340px] h-[340px] md:w-[440px] md:h-[440px] mx-auto my-4 flex items-center justify-center select-none">
          {/* Top Pointer Arrow */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 w-8 h-10 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.9)]" />
          </div>

          {/* SVG Wheel Circle */}
          <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_0_60px_rgba(168,85,247,0.4)]">
            <g
              style={{
                transform: `rotate(${rotationDegree}deg)`,
                transformOrigin: "200px 200px",
                transition: isSpinning ? "transform 4.5s cubic-bezier(0.15, 0.90, 0.20, 1.00)" : "none",
              }}
            >
              {rewards.map((reward, i) => {
                const numSlices = rewards.length || 6;
                const sliceAngle = 360 / numSlices;
                const startAngle = i * sliceAngle - 90;
                const endAngle = (i + 1) * sliceAngle - 90;
                const radStart = (startAngle * Math.PI) / 180;
                const radEnd = (endAngle * Math.PI) / 180;

                const x1 = 200 + 190 * Math.cos(radStart);
                const y1 = 200 + 190 * Math.sin(radStart);
                const x2 = 200 + 190 * Math.cos(radEnd);
                const y2 = 200 + 190 * Math.sin(radEnd);

                const pathData = `M 200 200 L ${x1} ${y1} A 190 190 0 0 1 ${x2} ${y2} Z`;

                const midAngle = (startAngle + endAngle) / 2;
                const radMid = (midAngle * Math.PI) / 180;
                const labelX = 200 + 125 * Math.cos(radMid);
                const labelY = 200 + 125 * Math.sin(radMid);

                return (
                  <g key={reward.id || i}>
                    <path
                      d={pathData}
                      fill={reward.color || "#a855f7"}
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    <g transform={`translate(${labelX}, ${labelY}) rotate(${midAngle + 90})`}>
                      <text
                        y="-6"
                        textAnchor="middle"
                        fontSize="22"
                        className="select-none"
                        style={{ userSelect: "none" }}
                      >
                        {reward.icon || "🎁"}
                      </text>
                      <text
                        y="14"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="900"
                        fill="#ffffff"
                        className="select-none font-sans uppercase tracking-tight"
                        style={{
                          userSelect: "none",
                          textShadow: "0 2px 4px rgba(0,0,0,0.8)"
                        }}
                      >
                        {reward.name}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>

            {/* Outer Border Ring */}
            <circle cx="200" cy="200" r="192" fill="none" stroke="#a855f7" strokeWidth="6" opacity="0.6" />
          </svg>

          {/* Center Button / Hub */}
          <div className="absolute z-20 w-20 h-20 md:w-24 md:h-24 bg-zinc-950 border-4 border-purple-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50">
            <Button
              onClick={handleSpin}
              disabled={isSpinning || !uid || !minecraftUsername}
              className="w-full h-full rounded-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs md:text-sm uppercase italic tracking-tighter flex flex-col items-center justify-center p-0 transition-transform active:scale-90"
            >
              {isSpinning ? (
                <span className="animate-pulse text-[10px]">AYLANMOQDA</span>
              ) : (
                <>
                  <Dices className="h-6 w-6 mb-0.5" />
                  SPIN!
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Won Prize Display Modal/Card */}
        {wonReward && (
          <Card className="border-emerald-500/40 bg-emerald-500/10 max-w-md mx-auto rounded-3xl p-6 text-center animate-in zoom-in-95">
            <div className="text-4xl mb-2">{wonReward.icon || "🎉"}</div>
            <h3 className="text-emerald-400 font-black text-xl italic uppercase">TABRIKLAYMIZ!</h3>
            <p className="text-white font-bold text-lg mt-1">
              &quot;{wonReward.name}&quot; mukofotini qo&apos;lga kiritdingiz!
            </p>
          </Card>
        )}
      </div>
      </main>
      <Footer />
    </div>
  );
}

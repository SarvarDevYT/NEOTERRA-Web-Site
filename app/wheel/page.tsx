"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dices, Sparkles, AlertCircle, Clock, ShieldCheck, Gamepad2, Gift } from "lucide-react";
import { toast } from "sonner";
import { getWheelRewardsAction, spinWheelAction, WheelReward } from "@/app/actions/wheel";
import Link from "next/link";

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

    setIsSpinning(true);
    setWonReward(null);

    const res = await spinWheelAction(uid);

    if (!res.success) {
      toast.error(res.message);
      setIsSpinning(false);
      return;
    }

    const reward = res.reward!;
    const rewardIndex = res.rewardIndex ?? 0;
    const sliceAngle = 360 / rewards.length;

    // Calculate rotation: 5 full spins (1800 deg) + offset to winning slice
    const targetSliceAngle = 360 - (rewardIndex * sliceAngle) - (sliceAngle / 2);
    const totalRotation = rotationDegree + 1800 + targetSliceAngle;

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

  const numSlices = rewards.length || 6;
  const sliceAngle = 360 / numSlices;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-black text-white relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container max-w-4xl mx-auto px-4 text-center relative z-10 space-y-8">
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

        {/* Wheel Graphic Container */}
        <div className="relative w-[320px] h-[320px] md:w-[420px] md:h-[420px] mx-auto my-6 flex items-center justify-center select-none">
          {/* Wheel Pointer Arrow */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 w-8 h-10 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
          </div>

          {/* Rotating Wheel Circle */}
          <div
            className="w-full h-full rounded-full border-4 border-purple-500/40 shadow-[0_0_80px_-10px_rgba(168,85,247,0.5)] overflow-hidden relative"
            style={{
              transform: `rotate(${rotationDegree}deg)`,
              transition: isSpinning ? "transform 4.5s cubic-bezier(0.15, 0.90, 0.20, 1.00)" : "none",
            }}
          >
            {rewards.map((reward, i) => {
              const rotate = i * sliceAngle;
              return (
                <div
                  key={reward.id}
                  className="absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left flex items-center justify-center"
                  style={{
                    transform: `rotate(${rotate}deg) skewY(-${90 - sliceAngle}deg)`,
                    backgroundColor: reward.color || "#a855f7",
                  }}
                >
                  <div
                    className="flex flex-col items-center justify-center text-white font-black text-xs md:text-sm tracking-wider"
                    style={{
                      transform: `skewY(${90 - sliceAngle}deg) rotate(${sliceAngle / 2}deg) translate(50px, -40px)`,
                    }}
                  >
                    <span className="text-xl md:text-2xl drop-shadow">{reward.icon}</span>
                    <span className="truncate max-w-[90px] drop-shadow">{reward.name}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Button / Hub */}
          <div className="absolute z-20 w-20 h-20 md:w-24 md:h-24 bg-zinc-950 border-4 border-purple-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50">
            <Button
              onClick={handleSpin}
              disabled={isSpinning || !uid || !minecraftUsername}
              className="w-full h-full rounded-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs md:text-sm uppercase italic tracking-tighter flex flex-col items-center justify-center p-0 transition-transform active:scale-90"
            >
              {isSpinning ? (
                <span className="animate-pulse">AYLANMOQDA...</span>
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
          <Card className="border-emerald-500/30 bg-emerald-500/10 max-w-md mx-auto rounded-3xl p-6 text-center animate-bounce">
            <div className="text-4xl mb-2">{wonReward.icon}</div>
            <h3 className="text-emerald-400 font-black text-2xl uppercase italic">TABRIKLAYMIZ!</h3>
            <p className="text-white font-bold text-lg mt-1">&quot;{wonReward.name}&quot; mukofotini qo&apos;lga kiritdingiz!</p>
          </Card>
        )}
      </div>
    </div>
  );
}

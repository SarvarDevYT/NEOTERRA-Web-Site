"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, RefreshCw, Edit2, Dices, Gift, User, Send } from "lucide-react";
import { toast } from "sonner";
import { 
  getWheelRewardsAction, 
  updateWheelRewardAction, 
  deleteWheelRewardAction, 
  grantWheelSpinByUsernameAdminAction,
  WheelReward 
} from "@/app/actions/wheel";

export default function AdminWheelPage() {
  const [rewards, setRewards] = useState<WheelReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<WheelReward | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Grant Spin State
  const [userInput, setUserInput] = useState("");
  const [spinCount, setSpinCount] = useState("1");
  const [isGranting, setIsGranting] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  async function fetchRewards() {
    setIsLoading(true);
    const data = await getWheelRewardsAction();
    setRewards(data);
    setIsLoading(false);
  }

  async function handleSaveReward(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const id = editingReward ? editingReward.id : String(Date.now());
    const rewardData: Partial<WheelReward> = {
      name: String(formData.get("name") ?? "").trim(),
      type: formData.get("type") as "balance" | "command" | "nothing",
      value: String(formData.get("value") ?? "").trim(),
      chance: Number(formData.get("chance")) || 10,
      color: String(formData.get("color") ?? "#a855f7"),
      icon: String(formData.get("icon") ?? "🎁"),
      order: Number(formData.get("order")) || 0,
    };

    const res = await updateWheelRewardAction(id, rewardData);
    if (res.success) {
      toast.success(res.message);
      setIsDialogOpen(false);
      setEditingReward(null);
      fetchRewards();
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Ushbu sovg'ani o'chirmoqchimisiz?")) return;
    const res = await deleteWheelRewardAction(id);
    if (res.success) {
      toast.success(res.message);
      fetchRewards();
    } else {
      toast.error(res.message);
    }
  }

  async function handleGrantSpins(e: React.FormEvent) {
    e.preventDefault();
    if (!userInput.trim()) return;
    const count = Math.max(1, parseInt(spinCount) || 1);

    setIsGranting(true);
    const res = await grantWheelSpinByUsernameAdminAction(userInput, count);
    if (res.success) {
      toast.success(res.message);
      setUserInput("");
      setSpinCount("1");
    } else {
      toast.error(res.message);
    }
    setIsGranting(false);
  }

  const openCreateModal = () => {
    setEditingReward(null);
    setIsDialogOpen(true);
  };

  const openEditModal = (reward: WheelReward) => {
    setEditingReward(reward);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Omad G&apos;ildiragi Sozlamalari
          </h1>
          <p className="text-zinc-400">Kunlik bepul sovg&apos;alar va ularning ehtimollik foizlarini boshqaring.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchRewards}
            disabled={isLoading}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5 font-bold gap-2 rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Yangilash
          </Button>

          <Button onClick={openCreateModal} className="bg-purple-600 hover:bg-purple-700 font-bold gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> Yangi Sovg&apos;a
          </Button>
        </div>
      </div>

      {/* Grant Wheel Spins Card */}
      <Card className="border-purple-500/30 bg-purple-500/10 rounded-2xl p-5 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center border border-purple-500/40">
              <Dices className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase italic tracking-tight text-purple-300">
                🎰 Foydalanuvchiga Omad G'ildiragi Berish
              </h3>
              <p className="text-xs text-zinc-400">O'yinchining niki yoki emaili bo'yicha g'ildirak aylantirish imkoniyatini taqdim eting.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleGrantSpins} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Minecraft nik yoki Email kiriting (masalan: Steve)"
              required
              className="border-white/10 bg-black/40 h-12 rounded-xl text-white font-bold placeholder:text-zinc-500"
            />
          </div>

          <div className="sm:col-span-3">
            <Input
              type="number"
              min="1"
              max="100"
              value={spinCount}
              onChange={(e) => setSpinCount(e.target.value)}
              placeholder="Soni (masalan: 1)"
              required
              className="border-white/10 bg-black/40 h-12 rounded-xl text-white font-bold"
            />
          </div>

          <div className="sm:col-span-3">
            <Button
              type="submit"
              disabled={isGranting || !userInput.trim()}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 font-bold rounded-xl gap-2 shadow-lg shadow-purple-600/30"
            >
              <Send className="h-4 w-4" /> {isGranting ? "BERILMOQDA..." : "IMKONIYAT BERISH"}
            </Button>
          </div>
        </form>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-white/10 bg-zinc-950/90 backdrop-blur-2xl rounded-[2.5rem] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white uppercase italic">
              {editingReward ? "SOVG'ANI TAHRIRLASH" : "YANGI SOVG'A QO'SHISH"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 font-medium">
              G&apos;ildirakdagi mukofot va uning berilish shartlarini kiriting.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveReward} className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Sovg&apos;a Nomi</Label>
                <Input
                  name="name"
                  defaultValue={editingReward?.name || ""}
                  placeholder="Masalan: 10,000 UZS Balans"
                  required
                  className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Icon / Emoji</Label>
                <Input
                  name="icon"
                  defaultValue={editingReward?.icon || "🎁"}
                  placeholder="💰"
                  required
                  className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold text-center text-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Mukofot Turi</Label>
                <Select name="type" defaultValue={editingReward?.type || "balance"}>
                  <SelectTrigger className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold">
                    <SelectValue placeholder="Tanlang" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                    <SelectItem value="balance">💰 Balans (Sayt)</SelectItem>
                    <SelectItem value="command">⚡ In-game Buyruq (/give, /lp)</SelectItem>
                    <SelectItem value="nothing">❌ Hech narsa (Omad kelmadi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Ehtimollik % (Weight)</Label>
                <Input
                  name="chance"
                  type="number"
                  defaultValue={editingReward?.chance ?? 15}
                  min="1"
                  max="100"
                  required
                  className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Qiymati / Buyruq</Label>
              <Input
                name="value"
                defaultValue={editingReward?.value || ""}
                placeholder="Balans uchun: 10000 | Buyruq uchun: lp user {username} parent addtemp vip 1d"
                className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-mono text-xs"
              />
              <p className="text-[10px] text-zinc-500 ml-1">Buyruqda <code className="text-purple-400">&#123;username&#125;</code> o&apos;rniga o&apos;yinchi niki qo&apos;yiladi.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Sektor Rangi (HEX)</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="color"
                    defaultValue={editingReward?.color || "#a855f7"}
                    className="w-10 h-12 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <Input
                    name="color"
                    defaultValue={editingReward?.color || "#a855f7"}
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Tartib (Order)</Label>
                <Input
                  name="order"
                  type="number"
                  defaultValue={editingReward?.order ?? rewards.length + 1}
                  className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-purple-600 hover:bg-purple-700 font-black tracking-widest italic rounded-2xl">
                {isSubmitting ? "SAQLANMOQDA..." : "SAQLASH"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rewards List */}
      {isLoading ? (
        <div className="text-center py-20 text-white/50 font-bold animate-pulse">Yuklanmoqda...</div>
      ) : (
        <div className="grid gap-3">
          {rewards.map((reward) => (
            <Card key={reward.id} className="border-white/5 bg-zinc-900/50 rounded-2xl hover:border-purple-500/20 transition-all">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                    style={{ backgroundColor: `${reward.color}20`, border: `1px solid ${reward.color}50` }}
                  >
                    {reward.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-black text-base">{reward.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/10 text-purple-300">
                        {reward.chance}% ehtimollik
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5 truncate max-w-md">
                      {reward.type === "balance" && `💰 Sayt balansiga +${Number(reward.value).toLocaleString()} UZS`}
                      {reward.type === "command" && `⚡ Buyruq: ${reward.value}`}
                      {reward.type === "nothing" && `❌ Puq (Omad kelmadi)`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={() => openEditModal(reward)} variant="outline" size="sm" className="rounded-xl border-white/10 text-white">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDelete(reward.id)} variant="outline" size="sm" className="rounded-xl border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

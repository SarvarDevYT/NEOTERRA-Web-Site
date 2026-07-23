"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, Plus, RefreshCw, Edit2, Tag, Percent } from "lucide-react";
import { toast } from "sonner";
import { 
  getPromoCodesAction, 
  savePromoCodeAction, 
  deletePromoCodeAction, 
  PromoCode 
} from "@/app/actions/promocodes";

export default function AdminPromoCodesPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPromos();
  }, []);

  async function fetchPromos() {
    setIsLoading(true);
    const data = await getPromoCodesAction();
    setPromos(data);
    setIsLoading(false);
  }

  async function handleSavePromo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const id = editingPromo ? editingPromo.id : "";
    const promoData: Partial<PromoCode> = {
      code: String(formData.get("code") ?? "").trim().toUpperCase(),
      discountPercent: Number(formData.get("discountPercent")) || 10,
      maxUses: Number(formData.get("maxUses")) || 100,
      expiresAt: String(formData.get("expiresAt") || "") || null,
      isActive: formData.get("isActive") === "on",
    };

    const res = await savePromoCodeAction(id, promoData);
    if (res.success) {
      toast.success(res.message);
      setIsDialogOpen(false);
      setEditingPromo(null);
      fetchPromos();
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Ushbu promokodni o'chirmoqchimisiz?")) return;
    const res = await deletePromoCodeAction(id);
    if (res.success) {
      toast.success(res.message);
      fetchPromos();
    } else {
      toast.error(res.message);
    }
  }

  const openCreateModal = () => {
    setEditingPromo(null);
    setIsDialogOpen(true);
  };

  const openEditModal = (promo: PromoCode) => {
    setEditingPromo(promo);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Promokodlar Boshqaruvi
          </h1>
          <p className="text-zinc-400">Do&apos;kon uchun chegirma kuponlari va aksiyalarni sozlang.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchPromos}
            disabled={isLoading}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5 font-bold gap-2 rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Yangilash
          </Button>

          <Button onClick={openCreateModal} className="bg-purple-600 hover:bg-purple-700 font-bold gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> Yangi Promokod
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] border-white/10 bg-zinc-950/90 backdrop-blur-2xl rounded-[2.5rem] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white uppercase italic">
              {editingPromo ? "PROMOKODNI TAHRIRLASH" : "YANGI PROMOKOD YARATISH"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSavePromo} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Promokod Kodi (Katta harfda)</Label>
              <Input
                name="code"
                defaultValue={editingPromo?.code || ""}
                placeholder="Masalan: SUMMER2026"
                required
                className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-mono font-bold uppercase text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Chegirma Foizi (%)</Label>
                <Input
                  name="discountPercent"
                  type="number"
                  defaultValue={editingPromo?.discountPercent ?? 15}
                  min="1"
                  max="100"
                  required
                  className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Maksimal Ishlatish Soni</Label>
                <Input
                  name="maxUses"
                  type="number"
                  defaultValue={editingPromo?.maxUses ?? 100}
                  required
                  className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Tugash Muddati (Ixtiyoriy)</Label>
              <Input
                name="expiresAt"
                type="date"
                defaultValue={editingPromo?.expiresAt ? editingPromo.expiresAt.substring(0, 10) : ""}
                className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                defaultChecked={editingPromo?.isActive ?? true}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
              <label htmlFor="isActive" className="text-sm font-bold text-white cursor-pointer">
                Promokod faol bo&apos;lsin
              </label>
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-purple-600 hover:bg-purple-700 font-black tracking-widest italic rounded-2xl">
                {isSubmitting ? "SAQLANMOQDA..." : "SAQLASH"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Promo Codes List */}
      {isLoading ? (
        <div className="text-center py-20 text-white/50 font-bold animate-pulse">Yuklanmoqda...</div>
      ) : (
        <div className="grid gap-3">
          {promos.map((promo) => (
            <Card key={promo.id} className="border-white/5 bg-zinc-900/50 rounded-2xl hover:border-purple-500/20 transition-all">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Tag className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-white font-black text-lg font-mono tracking-wider">{promo.code}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        -{promo.discountPercent}% CHEGIRMA
                      </span>
                      {!promo.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-400">
                          NOFAOL
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Ishlatildi: <strong className="text-white">{promo.usedCount}</strong> / {promo.maxUses} marta
                      {promo.expiresAt && ` • Muddat: ${new Date(promo.expiresAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={() => openEditModal(promo)} variant="outline" size="sm" className="rounded-xl border-white/10 text-white">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDelete(promo.id)} variant="outline" size="sm" className="rounded-xl border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white">
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

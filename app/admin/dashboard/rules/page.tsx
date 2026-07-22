"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { getRulesAction, createRuleAction, updateRuleAction, deleteRuleAction } from "@/app/actions/rules";
import { Gavel, Plus, Trash2, Edit2, ArrowUpDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Rule {
  id: string;
  title: string;
  title_ru?: string;
  title_en?: string;
  description: string;
  description_ru?: string;
  description_en?: string;
  order: number;
}

export default function RulesManagerPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  
  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<Rule | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    setIsLoading(true);
    const data = await getRulesAction();
    setRules(data as Rule[]);
    setIsLoading(false);
  }

  async function handleCreateRule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await createRuleAction(formData);

    if (result.success) {
      toast.success("Qoida muvaffaqiyatli qo'shildi!");
      setIsCreateOpen(false);
      fetchRules();
    } else {
      toast.error(result.message || "Xatolik yuz berdi");
    }
    setIsSubmitLoading(false);
  }

  async function handleEditRule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentRule) return;
    setIsSubmitLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await updateRuleAction(currentRule.id, formData);

    if (result.success) {
      toast.success("Qoida muvaffaqiyatli yangilandi!");
      setIsEditOpen(false);
      setCurrentRule(null);
      fetchRules();
    } else {
      toast.error(result.message || "Xatolik yuz berdi");
    }
    setIsSubmitLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Haqiqatan ham ushbu qoidani o'chirmoqchimisiz?")) return;

    const result = await deleteRuleAction(id);
    if (result.success) {
      toast.success("Qoida o'chirildi");
      fetchRules();
    } else {
      toast.error(result.message || "O'chirishda xatolik");
    }
  }

  const openEditDialog = (rule: Rule) => {
    setCurrentRule(rule);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Server Qoidalari
          </h1>
          <p className="text-zinc-400">Server qoidalarini qo'shing, tahrirlang yoki o'chiring.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchRules}
            disabled={isLoading}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5 font-bold gap-2 rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Yangilash
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 font-bold gap-2">
                <Plus className="h-4 w-4" /> Yangi Qoida
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] border-white/10 bg-zinc-950/80 backdrop-blur-2xl rounded-[2.5rem] text-white">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">
                  YANGI <span className="text-purple-500">QOIDA</span>
                </DialogTitle>
                <DialogDescription className="text-zinc-400 font-medium">
                  Qoidani tartib raqami va tavsifi bilan kiriting.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRule} className="space-y-5 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Qoida sarlavhasi (UZ)</label>
                  <Input
                    name="title"
                    placeholder="Masalan: 1.1 Cheating taqiqlangan"
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold transition-all focus:bg-white/10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Qoida sarlavhasi (RU)</label>
                  <Input
                    name="title_ru"
                    placeholder="Sarlavha (RU)..."
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold transition-all focus:bg-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Qoida sarlavhasi (EN)</label>
                  <Input
                    name="title_en"
                    placeholder="Sarlavha (EN)..."
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold transition-all focus:bg-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Tartib (Order)</label>
                  <Input
                    name="order"
                    type="number"
                    defaultValue={rules.length + 1}
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold transition-all focus:bg-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Qoida tavsifi (UZ)</label>
                  <Textarea
                    name="description"
                    placeholder="Batafsil ma'lumot (UZ)..."
                    className="h-24 border-white/10 bg-white/5 rounded-2xl text-white font-bold placeholder:text-zinc-700 transition-all focus:bg-white/10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Qoida tavsifi (RU)</label>
                  <Textarea
                    name="description_ru"
                    placeholder="Batafsil ma'lumot (RU)..."
                    className="h-24 border-white/10 bg-white/5 rounded-2xl text-white font-bold placeholder:text-zinc-700 transition-all focus:bg-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Qoida tavsifi (EN)</label>
                  <Textarea
                    name="description_en"
                    placeholder="Batafsil ma'lumot (EN)..."
                    className="h-24 border-white/10 bg-white/5 rounded-2xl text-white font-bold placeholder:text-zinc-700 transition-all focus:bg-white/10"
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={isSubmitLoading} className="w-full h-14 bg-primary hover:bg-primary/90 font-black tracking-widest italic rounded-2xl shadow-lg shadow-primary/20">
                    {isSubmitLoading ? "SAQLANMOQDA..." : "QOIDANI SAQLASH"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Rules list & edit dialog */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 text-center text-zinc-500 font-bold uppercase tracking-widest">
            Yuklanmoqda...
          </div>
        ) : rules.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 font-bold uppercase tracking-widest bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800">
            Hozircha qoidalar yo'q
          </div>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id} className="bg-zinc-900 border-zinc-800 overflow-hidden group">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-600/10 border border-purple-500/20 text-xs font-bold text-purple-400">
                  {rule.order}
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                      {rule.title}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(rule)}
                        className="text-zinc-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-full"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(rule.id)}
                        className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm whitespace-pre-wrap break-words pr-4">
                    {rule.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      {currentRule && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[450px] border-white/10 bg-zinc-950/80 backdrop-blur-2xl rounded-[2.5rem] text-white">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">
                QOIDANI <span className="text-purple-500">TAHRIRLASH</span>
              </DialogTitle>
              <DialogDescription className="text-zinc-400 font-medium">
                Kerakli maydonlarni o'zgartiring va saqlang.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditRule} className="space-y-5 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Qoida sarlavhasi (UZ)</label>
                <Input
                  name="title"
                  defaultValue={currentRule.title}
                  placeholder="Masalan: 1.1"
                  className="border-white/10 focus-visible:ring-primary h-12 bg-white/5 rounded-2xl text-white font-bold transition-all focus:bg-white/10"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Qoida sarlavhasi (RU)</label>
                <Input
                  name="title_ru"
                  defaultValue={currentRule.title_ru || ""}
                  placeholder="Masalan: 1.1"
                  className="border-white/10 focus-visible:ring-primary h-12 bg-white/5 rounded-2xl text-white font-bold transition-all focus:bg-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Qoida sarlavhasi (EN)</label>
                <Input
                  name="title_en"
                  defaultValue={currentRule.title_en || ""}
                  placeholder="Masalan: 1.1"
                  className="border-white/10 focus-visible:ring-primary h-12 bg-white/5 rounded-2xl text-white font-bold transition-all focus:bg-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Tartib (Order)</label>
                <Input
                  name="order"
                  type="number"
                  defaultValue={currentRule.order}
                  className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold transition-all focus:bg-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Qoida tavsifi (UZ)</label>
                <Textarea
                  name="description"
                  defaultValue={currentRule.description}
                  placeholder="Batafsil ma'lumot (UZ)..."
                  className="h-24 border-white/10 bg-white/5 rounded-2xl text-white font-bold transition-all focus:bg-white/10"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Qoida tavsifi (RU)</label>
                <Textarea
                  name="description_ru"
                  defaultValue={currentRule.description_ru || ""}
                  placeholder="Batafsil ma'lumot (RU)..."
                  className="h-24 border-white/10 bg-white/5 rounded-2xl text-white font-bold transition-all focus:bg-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Qoida tavsifi (EN)</label>
                <Textarea
                  name="description_en"
                  defaultValue={currentRule.description_en || ""}
                  placeholder="Batafsil ma'lumot (EN)..."
                  className="h-24 border-white/10 bg-white/5 rounded-2xl text-white font-bold transition-all focus:bg-white/10"
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={isSubmitLoading} className="w-full h-14 bg-primary hover:bg-primary/90 font-black tracking-widest italic rounded-2xl shadow-lg shadow-primary/20">
                  {isSubmitLoading ? "SAQLANMOQDA..." : "O'ZGARISHLARNI SAQLASH"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

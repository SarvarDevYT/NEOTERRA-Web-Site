"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import { Shield, Trash2, Plus, User, Send, MessageSquare, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { getStaffAction, createStaffAction, deleteStaffAction, updateStaffAction } from "@/app/actions/staff";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { TagRoleInput } from "@/components/admin/TagRoleInput";

interface StaffMember {
  id: string;
  nickname: string;
  role: string;
  discord: string | null;
  telegram: string | null;
  imageUrl: string | null;
  order: number;
}


export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);

  // Image states
  const [preview, setPreview] = useState<string | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    const data = await getStaffAction();
    setStaff(data as unknown as StaffMember[]);
    setIsLoading(false);
  }

  async function handleAddStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await createStaffAction(formData);

    if (result.success) {
      toast.success("Xodim muvaffaqiyatli qo'shildi!");
      setIsDialogOpen(false);
      setPreview(null);
      fetchStaff();
    } else {
      toast.error(result.message);
    }
    setIsSubmitLoading(false);
  }

  async function handleEditStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingMember) return;
    setIsSubmitLoading(true);

    const formData = new FormData(event.currentTarget);
    // imageUrl is passed by ImageUploader's hidden input automatically
    const result = await updateStaffAction(editingMember.id, formData);

    if (result.success) {
      toast.success("Xodim muvaffaqiyatli tahrirlandi!");
      setIsEditOpen(false);
      setEditingMember(null);
      setEditPreview(null);
      fetchStaff();
    } else {
      toast.error(result.message || "Tahrirlashda xatolik yuz berdi");
    }
    setIsSubmitLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Haqiqatan ham ushbu xodimni o'chirmoqchimisiz?")) return;

    const result = await deleteStaffAction(id);
    if (result.success) {
      toast.success("Xodim o'chirildi");
      fetchStaff();
    } else {
      toast.error(result.message);
    }
  }

  const openEditDialog = (member: StaffMember) => {
    setEditingMember(member);
    setEditPreview(member.imageUrl);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Jamoa Boshqaruvi
          </h1>
          <p className="text-zinc-400">Owner, Admin va Moderatorlarni boshqaring.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 font-bold gap-2">
              <Plus className="h-4 w-4" /> Yangi Xodim
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] border-white/10 bg-zinc-950/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(168,85,247,0.3)] text-white">
            <DialogHeader className="relative">
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />
              <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter liquid-shadow relative z-10">
                YANGI <span className="text-primary italic">XODIM</span>
              </DialogTitle>
              <DialogDescription className="text-zinc-400 font-medium">
                Xodimning Minecraft niki va ijtimoiy tarmoqlarini kiriting.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStaff} className="space-y-5 pt-4 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Minecraft Nik</label>
                <Input
                  id="nickname"
                  name="nickname"
                  placeholder="PlayerName"
                  className="border-white/10 focus-visible:ring-primary h-12 bg-white/5 rounded-2xl text-white font-bold placeholder:text-zinc-700 transition-all focus:bg-white/10"
                  required
                />
              </div>

              <TagRoleInput name="role" />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Discord (URL)</label>
                  <Input
                    id="discord"
                    name="discord"
                    placeholder="https://..."
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold placeholder:text-zinc-700 transition-all focus:bg-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Telegram (URL)</label>
                  <Input
                    id="telegram"
                    name="telegram"
                    placeholder="https://..."
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold placeholder:text-zinc-700 transition-all focus:bg-white/10"
                  />
                </div>
              </div>

              <ImageUploader
                name="imageFile"
                value={preview}
                onChange={setPreview}
                label="Maxsus Skin / Rasm (Ixtiyoriy)"
              />

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Tartib (0 - Ustunlik)</label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  defaultValue="0"
                  className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold transition-all focus:bg-white/10"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit" disabled={isSubmitLoading} className="w-full h-14 bg-primary hover:bg-primary/90 font-black tracking-widest italic rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                  {isSubmitLoading ? "QO'SHILMOQDA..." : "XODIMNI QO'SHISH"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-zinc-500 font-bold uppercase tracking-widest">
            Yuklanmoqda...
          </div>
        ) : staff.length === 0 ? (
          <div className="col-span-full py-20 text-center text-zinc-500 font-bold uppercase tracking-widest bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800">
            Hozircha xodimlar yo'q
          </div>
        ) : (
          staff.map((member) => (
            <Card key={member.id} className="bg-zinc-900 border-zinc-800 overflow-hidden group relative">
              <CardHeader className="pb-4 relative">
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={() => openEditDialog(member)}
                    className="p-2 rounded-full bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  {member.imageUrl ? (
                    <img 
                      src={member.imageUrl} 
                      alt={member.nickname} 
                      className="h-12 w-12 rounded-full object-cover border border-purple-500/20"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-500">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg font-bold text-white">{member.nickname}</CardTitle>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {member.role.split(",").map((r) => r.trim()).filter(Boolean).map((r) => (
                        <span key={r} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {r}
                        </span>
                      ))}
                      <span className="text-[9px] text-zinc-600 font-bold self-center">#{member.order}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {member.discord && (
                    <a href={member.discord} target="_blank" rel="noreferrer" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-8 text-[10px] uppercase font-black border-zinc-800 bg-zinc-950 text-white hover:bg-zinc-800">
                        <MessageSquare className="h-3 w-3 mr-2 text-indigo-400" /> Discord
                      </Button>
                    </a>
                  )}
                  {member.telegram && (
                    <a href={member.telegram} target="_blank" rel="noreferrer" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-8 text-[10px] uppercase font-black border-zinc-800 bg-zinc-950 text-white hover:bg-zinc-800">
                        <Send className="h-3 w-3 mr-2 text-sky-400" /> Telegram
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog Modal */}
      {editingMember && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[450px] border-white/10 bg-zinc-950/80 backdrop-blur-2xl rounded-[2.5rem] text-white">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">
                XODIMNI <span className="text-purple-500">TAHRIRLASH</span>
              </DialogTitle>
              <DialogDescription className="text-zinc-400 font-medium">
                Xodim ma'lumotlarini o'zgartiring va saqlang.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditStaff} className="space-y-5 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Minecraft Nik</label>
                <Input
                  name="nickname"
                  defaultValue={editingMember.nickname}
                  placeholder="PlayerName"
                  className="border-white/10 focus-visible:ring-primary h-12 bg-white/5 rounded-2xl text-white font-bold"
                  required
                />
              </div>

              <TagRoleInput name="role" defaultValue={editingMember.role} />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Discord (URL)</label>
                  <Input
                    name="discord"
                    defaultValue={editingMember.discord || ""}
                    placeholder="https://..."
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Telegram (URL)</label>
                  <Input
                    name="telegram"
                    defaultValue={editingMember.telegram || ""}
                    placeholder="https://..."
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold"
                  />
                </div>
              </div>

              <ImageUploader
                name="imageFile"
                value={editPreview}
                onChange={setEditPreview}
                label="Xodim rasmi (Yangilash, ixtiyoriy)"
              />

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Tartib (Order)</label>
                <Input
                  name="order"
                  type="number"
                  defaultValue={editingMember.order}
                  className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold"
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

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
  DialogFooter,
} from "@/components/ui/dialog";
import { Users, Search, Wallet, Shield, Send, RefreshCw, Gamepad2, SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { getAllUsersAdminAction, updateUserBalanceAdminAction } from "@/app/actions/player-profile";

interface UserItem {
  uid: string;
  email: string;
  role: string;
  minecraftUsername: string | null;
  balance: number;
  telegramUsername: string | null;
  createdAt: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [mode, setMode] = useState<"add" | "set">("add");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    const data = await getAllUsersAdminAction();
    setUsers(data as UserItem[]);
    setIsLoading(false);
  }

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q) ||
      (u.minecraftUsername && u.minecraftUsername.toLowerCase().includes(q)) ||
      (u.telegramUsername && u.telegramUsername.toLowerCase().includes(q))
    );
  });

  async function handleBalanceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !amountInput) return;
    const val = Number(amountInput);
    if (isNaN(val)) {
      toast.error("Miqdor raqam bo'lishi kerak!");
      return;
    }

    setIsSubmitting(true);
    const res = await updateUserBalanceAdminAction(selectedUser.uid, val, mode === "set");
    if (res.success) {
      toast.success(`Balans ${mode === "add" ? "qo'shildi" : "o'zgartirildi"}!`);
      setIsBalanceDialogOpen(false);
      setAmountInput("");
      fetchUsers();
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Foydalanuvchilar Boshqaruvi
          </h1>
          <p className="text-zinc-400">
            Foydalanuvchilar ro'yxati, profil ma'lumotlari va balansni admin orqali to'ldirish.
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline" className="border-white/10 text-white hover:bg-white/5 gap-2">
          <RefreshCw className="h-4 w-4" /> Yangilash
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Email, Donat ID, Minecraft nik yoki Telegram boyicha qidirish..."
          className="pl-12 h-14 bg-zinc-900/50 border-white/10 rounded-2xl text-white font-medium"
        />
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="text-center py-20 text-white/50 font-bold animate-pulse">Yuklanmoqda...</div>
      ) : filteredUsers.length === 0 ? (
        <Card className="border-white/5 bg-zinc-900/50 rounded-2xl">
          <CardContent className="text-center py-16">
            <Users className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-bold">Hech qanday foydalanuvchi topilmadi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.uid} className="border-white/5 bg-zinc-900/50 rounded-2xl hover:border-purple-500/20 transition-all">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-base">{user.email}</span>
                    {user.role === "admin" && (
                      <span className="bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                    <span>ID: <code className="text-zinc-300 font-mono select-all">{user.uid}</code></span>
                    {user.minecraftUsername && (
                      <span className="flex items-center gap-1 text-green-400 font-bold">
                        <Gamepad2 className="h-3 w-3" /> {user.minecraftUsername}
                      </span>
                    )}
                    {user.telegramUsername && (
                      <span className="flex items-center gap-1 text-blue-400 font-bold">
                        <SendHorizontal className="h-3 w-3" /> {user.telegramUsername}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center">
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Balans</span>
                    <span className="text-lg font-black text-emerald-400">
                      {user.balance.toLocaleString()} UZS
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedUser(user);
                      setIsBalanceDialogOpen(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 rounded-xl"
                  >
                    <Wallet className="h-4 w-4" /> Balans Qo'shish
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Balance Topup Dialog */}
      <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
        <DialogContent className="sm:max-w-[420px] border-white/10 bg-zinc-950/90 backdrop-blur-2xl rounded-[2.5rem] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white uppercase italic">
              BALANS <span className="text-emerald-400">BOSHQARUVI</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              {selectedUser?.email} uchun balans miqdorini o'zgartiring.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBalanceSubmit} className="space-y-4 pt-2">
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
              <button
                type="button"
                onClick={() => setMode("add")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === "add" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                + Qo'shish (Increment)
              </button>
              <button
                type="button"
                onClick={() => setMode("set")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === "set" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                = O'rnatish (Set)
              </button>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Summa (UZS)
              </Label>
              <Input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="Masalan: 50000"
                required
                className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold text-lg"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-2xl">
                {isSubmitting ? "SAQLANMOQDA..." : "BALANSGA YOZISH"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import { Trash2, Plus, Server, Copy, Check, Shield, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getAllServersAction, createServerAction, updateServerAction, deleteServerAction } from "@/app/actions/servers";

interface ServerItem {
  id: string;
  name: string;
  displayName: string;
  order: number;
  isActive: boolean;
}

export default function AdminServersPage() {
  const [servers, setServers] = useState<ServerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);

  const GLOBAL_SECRET_KEY = "neoterra2026Nsarvar2010Sneoterrateamuz";

  useEffect(() => {
    fetchServers();
  }, []);

  async function fetchServers() {
    setIsLoading(true);
    const data = await getAllServersAction();
    setServers(data as ServerItem[]);
    setIsLoading(false);
  }

  async function handleAddServer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await createServerAction(formData);
    if (result.success) {
      toast.success("Server qo'shildi!");
      setIsDialogOpen(false);
      fetchServers();
    } else {
      toast.error(result.message);
    }
    setIsSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(`"${id}" serverini o'chirmoqchimisiz? Bu serverdagi barcha donatlar ham ishlashdan to'xtaydi!`)) return;
    const result = await deleteServerAction(id);
    if (result.success) {
      toast.success("Server o'chirildi!");
      fetchServers();
    } else {
      toast.error(result.message);
    }
  }

  async function handleToggleActive(server: ServerItem) {
    const formData = new FormData();
    formData.set("name", server.name);
    formData.set("displayName", server.displayName);
    formData.set("order", String(server.order));
    formData.set("isActive", String(!server.isActive));
    const result = await updateServerAction(server.id, formData);
    if (result.success) {
      toast.success(server.isActive ? "Server o'chirildi" : "Server yoqildi");
      fetchServers();
    }
  }

  function copyGlobalKey() {
    navigator.clipboard.writeText(GLOBAL_SECRET_KEY);
    setCopiedKey(true);
    toast.success("Secret Key nusxalandi!");
    setTimeout(() => setCopiedKey(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Serverlar Boshqaruvi
          </h1>
          <p className="text-zinc-400">Minecraft serverlarni monitoring qiling va boshqaring.</p>
        </div>

        <Button
          onClick={fetchServers}
          disabled={isLoading}
          variant="outline"
          className="border-white/10 text-white hover:bg-white/5 font-bold gap-2 rounded-xl"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Yangilash
        </Button>
      </div>

      {/* Global Secret Key Card */}
      <Card className="border-purple-500/20 bg-purple-500/5 rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-wider">🔐 Global Secret Key</h3>
              <p className="text-zinc-500 text-xs">Barcha serverlar uchun bitta kalit ishlatiladi</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-black/30 rounded-xl border border-white/5">
            <code className="text-purple-300 font-mono text-sm flex-1 select-all">{GLOBAL_SECRET_KEY}</code>
            <button
              onClick={copyGlobalKey}
              className="text-zinc-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
            >
              {copiedKey ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-amber-500/80 text-[10px] mt-2 font-bold ml-1">
            ⚠️ Bu kalitni har bir Minecraft server&apos;dagi plugin <code className="text-blue-400">config.yml</code> → <code className="text-blue-400">api.secret-key</code> ga qo&apos;ying. Vercel&apos;da ham <code className="text-blue-400">SERVER_API_KEY</code> sifatida o&apos;rnatilgan.
          </p>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-500/20 bg-blue-500/5 rounded-2xl">
        <CardContent className="p-4 text-sm text-blue-300 space-y-2">
          <p className="font-bold text-blue-400">📋 Qanday ishlaydi:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-400">
            <li>Minecraft serveringizdagi <code className="text-blue-400">NeoTerraCore/config.yml</code> faylida <strong className="text-white">server-id</strong> va <strong className="text-white">server-name</strong> o&apos;rnating</li>
            <li><code className="text-blue-400">config.yml</code> dagi <strong className="text-white">secret-key</strong> ga yuqoridagi global kalitni nusxalang</li>
            <li>Serverni yoqing yoki <code className="text-blue-400">/neoterra reload</code> qiling — server avtomatik ravshda shu yerda va sayt do&apos;konida paydo bo&apos;ladi!</li>
            <li>Status va o&apos;yinchilar soni har 30 soniyada avtomatik yangilanib turadi</li>
          </ol>
        </CardContent>
      </Card>

      {/* Server Cards */}
      {isLoading ? (
        <div className="text-center py-20 text-white/50 font-bold animate-pulse">Yuklanmoqda...</div>
      ) : servers.length === 0 ? (
        <Card className="border-white/5 bg-zinc-900/50 rounded-2xl">
          <CardContent className="text-center py-16">
            <Server className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-bold">Hali hech qanday server ulanmagan</p>
            <p className="text-zinc-600 text-sm mt-1">Minecraft serveringizda NeoTerraCore plaginini yoqing, server avtomatik ro&apos;yxatdan o&apos;tadi.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {servers.map((server: any) => (
            <Card key={server.id} className="border-white/5 bg-zinc-900/50 rounded-2xl hover:border-purple-500/20 transition-all">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-3.5 h-3.5 rounded-full mt-1.5 shrink-0 ${
                      server.status === "online" 
                        ? "bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" 
                        : "bg-red-500/80"
                    }`} />
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-black text-lg">{server.displayName || server.name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          server.status === "online"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}>
                          {server.status === "online" ? "🟢 ONLINE" : "🔴 OFFLINE"}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-400 italic">
                        {server.motd || "NeoTerra Minecraft Server"}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-500">
                        <span className="font-mono bg-zinc-800/80 text-zinc-300 px-2 py-0.5 rounded">ID: {server.id}</span>
                        {server.status === "online" && (
                          <span className="text-emerald-400 font-bold">
                            👥 {server.onlinePlayers || 0} / {server.maxPlayers || 100} o'yinchi
                          </span>
                        )}
                        <span className="text-zinc-600">Tartib: {server.order}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Button
                      onClick={() => handleToggleActive(server)}
                      variant="outline"
                      size="sm"
                      className={`rounded-xl text-xs font-bold ${server.isActive ? "border-green-500/30 text-green-400" : "border-zinc-700 text-zinc-500"}`}
                    >
                      {server.isActive ? "Yoqilgan" : "O'chirilgan"}
                    </Button>
                    <Button
                      onClick={() => handleDelete(server.id)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

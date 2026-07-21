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
import { Trash2, Plus, Server, Eye, EyeOff, Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getAllServersAction, createServerAction, updateServerAction, deleteServerAction } from "@/app/actions/servers";

interface ServerItem {
  id: string;
  name: string;
  displayName: string;
  order: number;
  isActive: boolean;
  secretKey: string;
}

function generateSecretKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let key = "";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export default function AdminServersPage() {
  const [servers, setServers] = useState<ServerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(generateSecretKey());
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      setGeneratedKey(generateSecretKey());
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

  function toggleKeyVisibility(id: string) {
    const next = new Set(visibleKeys);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setVisibleKeys(next);
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Serverlar Boshqaruvi
          </h1>
          <p className="text-zinc-400">Minecraft serverlarni qo'shing va boshqaring. Har bir serverning alohida secret key'i bor.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 font-bold gap-2">
              <Plus className="h-4 w-4" /> Yangi Server
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] border-white/10 bg-zinc-950/80 backdrop-blur-2xl rounded-[2.5rem] text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white uppercase italic">
                YANGI <span className="text-purple-500">SERVER</span>
              </DialogTitle>
              <DialogDescription className="text-zinc-400 font-medium">
                Minecraft serveringizni saytga qo'shing.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddServer} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Server ID (lotin harflari, raqamlar)</Label>
                <Input
                  name="id"
                  placeholder="Masalan: survival"
                  required
                  pattern="[a-z0-9_-]+"
                  className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold font-mono"
                />
                <p className="text-[9px] text-zinc-600 ml-1">Plugin config.yml dagi server-id bilan bir xil bo'lishi kerak!</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Server Nomi</Label>
                  <Input
                    name="name"
                    placeholder="Survival Server"
                    required
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Ko'rsatiladigan Nomi</Label>
                  <Input
                    name="displayName"
                    placeholder="🌍 Survival"
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Tartib (Order)</Label>
                <Input
                  name="order"
                  type="number"
                  defaultValue="0"
                  className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  🔐 Secret Key (xavfsizlik kaliti)
                </Label>
                <div className="flex gap-2">
                  <Input
                    name="secretKey"
                    defaultValue={generatedKey}
                    required
                    minLength={16}
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-mono text-sm flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => setGeneratedKey(generateSecretKey())}
                    className="bg-zinc-800 hover:bg-zinc-700 h-12 px-3 rounded-2xl"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[9px] text-amber-500 ml-1 font-bold">
                  ⚠️ Bu kalitni plugin'ning config.yml dagi "api.secret-key" ga nusxalang!
                </p>
              </div>

              <DialogFooter className="pt-2">
                <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-purple-600 hover:bg-purple-700 font-black tracking-widest italic rounded-2xl">
                  {isSubmitting ? "QO'SHILMOQDA..." : "SERVERNI QO'SHISH"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      <Card className="border-blue-500/20 bg-blue-500/5 rounded-2xl">
        <CardContent className="p-4 text-sm text-blue-300 space-y-2">
          <p className="font-bold text-blue-400">📋 Qanday ishlaydi:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-400">
            <li>Shu yerda yangi server qo'shing va <strong className="text-white">Secret Key</strong> avtomatik yaratiladi</li>
            <li>Plugin JAR faylni Minecraft server <code className="text-blue-400">plugins/</code> papkasiga joylashtiring</li>
            <li>Plugin <code className="text-blue-400">config.yml</code> da <strong className="text-white">server-id</strong> va <strong className="text-white">secret-key</strong> ni shu sahifadagiga mos o'zgartiring</li>
            <li>Serverni qayta ishga tushiring yoki <code className="text-blue-400">/neoterra reload</code> buyrug'ini yozing</li>
            <li>Admin → Do'kon sahifasida server tanlab donatlarni qo'shing</li>
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
            <p className="text-zinc-500 font-bold">Hali hech qanday server qo'shilmagan</p>
            <p className="text-zinc-600 text-sm mt-1">Yuqoridagi "Yangi Server" tugmasini bosing</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {servers.map((server) => (
            <Card key={server.id} className="border-white/5 bg-zinc-900/50 rounded-2xl hover:border-purple-500/20 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${server.isActive ? "bg-green-500 shadow-lg shadow-green-500/50" : "bg-zinc-600"}`} />
                    <div>
                      <h3 className="text-white font-black text-lg">{server.displayName || server.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-zinc-500 text-xs font-mono bg-zinc-800 px-2 py-0.5 rounded">ID: {server.id}</span>
                        <span className="text-zinc-600 text-xs">Tartib: {server.order}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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

                {/* Secret Key Display */}
                <div className="mt-4 p-3 bg-black/30 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">🔐 Secret Key</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleKeyVisibility(server.id)}
                        className="text-zinc-500 hover:text-white transition-colors p-1"
                      >
                        {visibleKeys.has(server.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(server.secretKey, server.id)}
                        className="text-zinc-500 hover:text-white transition-colors p-1"
                      >
                        {copiedId === server.id ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-white font-mono text-sm mt-1 select-all">
                    {visibleKeys.has(server.id) ? server.secretKey : "••••••••••••••••••••••••••••••••"}
                  </p>
                  <p className="text-amber-500/60 text-[9px] mt-1">
                    Bu kalitni plugin config.yml dagi "api.secret-key" ga nusxalang
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

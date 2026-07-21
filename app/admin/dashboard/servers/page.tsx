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
import { Trash2, Plus, Server, Copy, Check, Shield } from "lucide-react";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
          <p className="text-zinc-400">Minecraft serverlarni qo&apos;shing va boshqaring.</p>
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
                Minecraft serveringizni saytga qo&apos;shing.
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
                <p className="text-[9px] text-zinc-600 ml-1">Plugin config.yml dagi server-id bilan bir xil bo&apos;lishi kerak!</p>
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
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Ko&apos;rsatiladigan Nomi</Label>
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

              <DialogFooter className="pt-2">
                <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-purple-600 hover:bg-purple-700 font-black tracking-widest italic rounded-2xl">
                  {isSubmitting ? "QO'SHILMOQDA..." : "SERVERNI QO'SHISH"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
            <li>Shu yerda yangi server qo&apos;shing (faqat ID va nom kerak)</li>
            <li>Plugin JAR faylni Minecraft server <code className="text-blue-400">plugins/</code> papkasiga joylashtiring</li>
            <li>Plugin <code className="text-blue-400">config.yml</code> da <strong className="text-white">server-id</strong> ni shu sahifadagi ID bilan bir xil qiling</li>
            <li><code className="text-blue-400">config.yml</code> dagi <strong className="text-white">secret-key</strong> ga yuqoridagi global kalitni nusxalang</li>
            <li>Serverni qayta ishga tushiring yoki <code className="text-blue-400">/neoterra reload</code> buyrug&apos;ini yozing</li>
            <li>Admin → Do&apos;kon sahifasida server tanlab donatlarni qo&apos;shing</li>
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
            <p className="text-zinc-500 font-bold">Hali hech qanday server qo&apos;shilmagan</p>
            <p className="text-zinc-600 text-sm mt-1">Yuqoridagi &quot;Yangi Server&quot; tugmasini bosing</p>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

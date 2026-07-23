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
} from "@/components/ui/dialog";
import { Trash2, Plus, Server, Copy, Check, Shield, RefreshCw, Terminal, Send } from "lucide-react";
import { toast } from "sonner";
import { 
  getAllServersAction, 
  updateServerAction, 
  deleteServerAction,
  sendConsoleCommandAction,
  getConsoleLogsAction
} from "@/app/actions/servers";

interface ServerItem {
  id: string;
  name: string;
  displayName: string;
  order: number;
  isActive: boolean;
  status?: string;
  motd?: string;
  onlinePlayers?: number;
  maxPlayers?: number;
}

export default function AdminServersPage() {
  const [servers, setServers] = useState<ServerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);

  // Console state
  const [activeConsoleServer, setActiveConsoleServer] = useState<ServerItem | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<any[]>([]);
  const [commandInput, setCommandInput] = useState("");
  const [isSendingCmd, setIsSendingCmd] = useState(false);

  const GLOBAL_SECRET_KEY = "neoterra2026Nsarvar2010Sneoterrateamuz";

  useEffect(() => {
    fetchServers();
  }, []);

  useEffect(() => {
    let interval: any;
    if (activeConsoleServer) {
      fetchConsoleLogs(activeConsoleServer.id);
      interval = setInterval(() => {
        fetchConsoleLogs(activeConsoleServer.id);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeConsoleServer]);

  async function fetchConsoleLogs(serverId: string) {
    const logs = await getConsoleLogsAction(serverId);
    setConsoleLogs(logs);
  }

  async function handleSendConsoleCommand(e: React.FormEvent) {
    e.preventDefault();
    if (!commandInput.trim() || !activeConsoleServer) return;

    setIsSendingCmd(true);
    const cmd = commandInput.trim();
    setCommandInput("");

    const res = await sendConsoleCommandAction(activeConsoleServer.id, cmd);
    if (res.success) {
      toast.success("Buyruq yuborildi!");
      fetchConsoleLogs(activeConsoleServer.id);
    } else {
      toast.error(res.message);
    }
    setIsSendingCmd(false);
  }

  async function fetchServers() {
    setIsLoading(true);
    const data = await getAllServersAction();
    setServers(data as ServerItem[]);
    setIsLoading(false);
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
          <p className="text-zinc-400">Minecraft serverlarni monitoring qiling va masofadan boshqaring.</p>
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
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-500">
                        <span className="font-mono bg-zinc-800/80 text-zinc-300 px-2 py-0.5 rounded">ID: {server.id}</span>
                        {server.status === "online" && (
                          <span className="text-emerald-400 font-bold">
                            👥 {server.onlinePlayers || 0} / {server.maxPlayers || 100} o'yinchi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Button
                      onClick={() => setActiveConsoleServer(server)}
                      className="bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-xl text-xs font-bold gap-2 border border-purple-500/30"
                    >
                      <Terminal className="h-4 w-4" /> Live Konsol
                    </Button>
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

      {/* Live Web Console Modal */}
      <Dialog open={!!activeConsoleServer} onOpenChange={(open) => !open && setActiveConsoleServer(null)}>
        <DialogContent className="sm:max-w-[700px] border-white/10 bg-black/95 text-white rounded-[2rem] p-6 shadow-2xl shadow-purple-500/20">
          <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/10">
            <div>
              <DialogTitle className="text-xl font-black text-purple-400 uppercase italic flex items-center gap-2">
                <Terminal className="h-5 w-5" /> WEB KONSOL — {activeConsoleServer?.displayName || activeConsoleServer?.name}
              </DialogTitle>
              <p className="text-xs text-zinc-500 mt-0.5">NeoTerraCore orqali 100% xavfsiz masofaviy buyruq ijro etish oynasi.</p>
            </div>
          </DialogHeader>

          {/* Terminal Screen */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 h-[350px] overflow-y-auto font-mono text-xs space-y-2 text-zinc-300">
            <div className="text-zinc-600 italic">=== Live Web Console Connected (ID: {activeConsoleServer?.id}) ===</div>
            {consoleLogs.length === 0 ? (
              <div className="text-zinc-600 py-10 text-center">Konsol buyruqlari jurnali bo'sh...</div>
            ) : (
              consoleLogs.map((log) => (
                <div key={log.id} className="space-y-0.5 border-b border-zinc-900/60 pb-1.5">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-purple-400 font-bold">[{log.username}]</span>
                    <span className="text-zinc-500">{log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ""}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      log.status === "executed" ? "bg-emerald-500/20 text-emerald-400" :
                      log.status === "pending" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="text-emerald-400 font-bold pl-2">&gt; {log.command}</div>
                  {log.responseLog && (
                    <div className="text-zinc-400 pl-4 whitespace-pre-wrap">{log.responseLog}</div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Input Prompt */}
          <form onSubmit={handleSendConsoleCommand} className="flex gap-2 pt-2">
            <Input
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Masalan: say Assalomu alaykum! yoki give Player diamond 64"
              className="border-white/10 bg-white/5 h-12 rounded-xl font-mono text-xs text-emerald-400 focus:ring-purple-500"
            />
            <Button
              type="submit"
              disabled={isSendingCmd || !commandInput.trim()}
              className="bg-purple-600 hover:bg-purple-700 font-bold h-12 px-6 rounded-xl gap-2 shrink-0"
            >
              <Send className="h-4 w-4" /> Yuborish
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

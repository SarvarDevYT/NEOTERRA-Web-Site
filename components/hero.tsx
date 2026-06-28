"use client"

import { Copy, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { useEffect, useState } from "react" // server status uchun hooklar qo'shildi
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"

interface ServerStatus {
  online: boolean
  players?: {
    online: number
    max: number
  }
}

export function Hero() {
  const { toast } = useToast()
  const { t } = useTranslation()
  const IP = "play.neoterra.uz"
  const [status, setStatus] = useState<ServerStatus | null>(null)

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch(`https://api.mcsrvstat.us/3/${IP}`)
        const data = await res.json()
        setStatus({
          online: data.online,
          players: data.players,
        })
      } catch (error) {
        console.error("[v0] Server status error:", error)
      }
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 60000) // Har minutda yangilash
    return () => clearInterval(interval)
  }, [IP])

  const copyIP = () => {
    navigator.clipboard.writeText(IP)
    toast({
      title: t("hero", "copied"),
      description: t("hero", "ready"),
      className: "bg-primary text-white border-none",
    })
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 pt-24 pb-20 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1200px] pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/20 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 text-center max-w-4xl">
        <div className="mb-10 flex justify-center scale-90 md:scale-100">
          <div className="relative size-[300px] md:size-[400px] rounded-full p-2 glass-effect border-white/20 liquid-shadow animate-float group">
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10 shadow-inner">
              <Image
                src="/neoterra-new-logo.jpg"
                alt="Neo Terra Logo"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                priority
              />
              {/* Caustic glass reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none opacity-50" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter leading-none italic">
          {t("hero", "uzbekistan")} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{t("hero", "modern")}</span>{" "}
          <br />
          {t("hero", "server")}
        </h1>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <div
            onClick={copyIP}
            className="group glass-effect px-8 py-4 rounded-[2rem] cursor-pointer hover:bg-white/10 transition-all duration-500 active:scale-95"
          >
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-primary/80 font-bold uppercase tracking-[0.2em]">{t("hero", "serverIp")}</span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-mono text-white font-bold">{IP}</span>
                <Copy className="size-5 text-white/40 group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>

          <Button
            size="lg"
            className="h-full py-5 px-10 bg-white text-black hover:bg-white/90 font-black italic text-xl rounded-[2rem] shadow-2xl transition-transform hover:scale-105"
          >
            {t("hero", "startPlaying")} <Play className="ml-2 fill-current size-5" />
          </Button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="glass-effect px-6 py-4 rounded-[2rem] flex flex-col items-center min-w-[160px]">
            <span className="text-2xl font-bold text-white liquid-shadow">{status?.players?.online ?? "..."}</span>
            <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold">{t("hero", "online")}</span>
          </div>
          <div className="glass-effect px-6 py-4 rounded-[2rem] flex flex-col items-center min-w-[160px]">
            <span
              className={cn(
                "text-2xl font-bold uppercase liquid-shadow",
                status?.online ? "text-green-400" : "text-red-400",
              )}
            >
              {status ? (status.online ? "Online" : "Offline") : "..."}
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold">{t("hero", "status")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

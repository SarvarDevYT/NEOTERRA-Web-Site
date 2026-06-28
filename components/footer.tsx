import { Instagram, Youtube, MessageSquare } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="glass-effect border-t border-white/5 mt-20 py-12 rounded-t-[3rem]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tighter text-white">
                NEO<span className="text-primary">TERRA</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O'zbekistondagi eng innovatsion Minecraft serveri. Biz bilan sarguzashtlaringizni boshlang!
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs text-primary">Havolalar</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">
                Bosh sahifa
              </Link>
              <Link href="/shop" className="hover:text-primary transition-colors">
                Do'kon
              </Link>
              <Link href="/rules" className="hover:text-primary transition-colors">
                Qoidalar
              </Link>
              <Link href="/help" className="hover:text-primary transition-colors">
                Yordam
              </Link>
              <Link href="/social" className="hover:text-primary transition-colors">
                Ijtimoiy tarmoqlar
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs text-primary">Biz bilan ulaning</h4>
            <div className="flex gap-4">
              <Link
                href="https://t.me/NeoTerraServer"
                className="size-10 flex items-center justify-center rounded-xl bg-secondary/50 border border-white/5 hover:border-primary/50 text-white transition-all"
              >
                <MessageSquare className="size-5" />
              </Link>
              <Link
                href="https://neoterra-soon.netlify.app"
                className="size-10 flex items-center justify-center rounded-xl bg-secondary/50 border border-white/5 hover:border-primary/50 text-white transition-all"
              >
                <Instagram className="size-5" />
              </Link>
              <Link
                href="https://www.youtube.com/@NeoTerraMC"
                className="size-10 flex items-center justify-center rounded-xl bg-secondary/50 border border-white/5 hover:border-primary/50 text-white transition-all"
              >
                <Youtube className="size-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-medium uppercase tracking-widest">
          <p>© 2026 PLAY.NEOTERRA.UZ. Barcha huquqlar himoyalangan.</p>
          <p>Mojang AB bilan aloqador emas.</p>
        </div>
      </div>
    </footer>
  )
}

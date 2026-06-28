import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Instagram, Send, Youtube, Mail } from "lucide-react"

export default function SocialPage() {
  const socials = [
    { name: "Telegram", icon: <Send className="size-6" />, color: "bg-[#0088cc]", link: "https://t.me/NeoTerraUz" },
    { name: "Instagram", icon: <Instagram className="size-6" />, color: "bg-[#e4405f]", link: "https://neoterra-soon.netlify.app" },
    { name: "YouTube", icon: <Youtube className="size-6" />, color: "bg-[#ff0000]", link: "https://www.youtube.com/@NeoTerraMC" },
    { name: "Email", icon: <Mail className="size-6" />, color: "bg-[#000000]", link: "mailto:neoterramc@gmail.com" },
  ]

  return (
    <main className="min-h-screen bg-background pt-32">
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-6 liquid-shadow">
          BIZNING <span className="text-primary">IJTIMOIY TARMOQLAR</span>
        </h1>
        <p className="text-white/50 mb-16 max-w-2xl mx-auto font-medium">
          Bizni kuzatib boring va yangiliklardan birinchi bo'lib xabardor bo'ling!
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {socials.map((social) => (
            <a key={social.name} href={social.link} className="block group">
              <div className="glass-effect p-12 rounded-[3rem] group-hover:bg-white/[0.08] group-hover:scale-[1.02] transition-all duration-700 flex flex-col items-center gap-8 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div
                  className={`${social.color} size-20 rounded-3xl text-white shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 relative z-10`}
                >
                  {social.icon}
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tight relative z-10">
                  {social.name}
                </h3>
                <Button className="w-full bg-white text-black hover:bg-white/90 font-black rounded-2xl py-6 relative z-10 shadow-xl">
                  OBUNA BO'LISH
                </Button>
              </div>
            </a>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  )
}

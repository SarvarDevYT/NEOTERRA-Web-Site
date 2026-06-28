import { Hero } from "@/components/hero"
import { Footer } from "@/components/footer"
import { NewsSection } from "@/components/news-section"

export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/30">
      {/* Glow effect for content transition */}
      <Hero />
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Welcome Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-4 liquid-shadow">Xush kelibsiz!</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
            Neo Terra serverining rasmiy do'koniga xush kelibsiz. Eng yaxshi buyumlar va ranklarni topish uchun do'kon
            bo'limiga o'ting.
          </p>
        </section>

        {/* News Section */}
        <NewsSection />
      </div>
      <Footer />
    </main>
  )
}

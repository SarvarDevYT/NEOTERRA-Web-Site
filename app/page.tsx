import { Hero } from "@/components/hero"
import { Footer } from "@/components/footer"
import { NewsSection } from "@/components/news-section"
import { WelcomeSection } from "@/components/WelcomeSection"

export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/30">
      {/* Glow effect for content transition */}
      <Hero />
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Multilingual Welcome Section */}
        <WelcomeSection />

        {/* News Section */}
        <NewsSection />
      </div>
      <Footer />
    </main>
  )
}

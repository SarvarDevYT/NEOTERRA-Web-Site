import { ProductGrid } from "@/components/product-grid"
import { Footer } from "@/components/footer"

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="pt-10">
        <ProductGrid />
      </div>
      <Footer />
    </main>
  )
}

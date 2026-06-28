"use client"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Copy, Check, ExternalLink, CreditCard, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { updateMinecraftUsername } from "@/app/actions/player-profile"
import { getProductsAction } from "@/app/actions/products"
import { ProductDialog } from "./product-dialog"

import { useTranslation } from "@/hooks/use-translation"

const CATEGORIES = ["RANKLAR", "KEYS-LAR", "VALYUTA", "UNBAN/UNMUTE"]

interface Product {
  id: string;
  name: string;
  name_ru?: string;
  name_en?: string;
  price: string;
  category: string;
  type: string;
  image: string;
  order: number;
  description?: string;
  description_ru?: string;
  description_en?: string;
}

export function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState("RANKLAR")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [tokenQuantity, setTokenQuantity] = useState("")
  const [paymentType, setPaymentType] = useState<"telegram" | "auto">("telegram")
  const { uid, minecraftUsername, setMinecraftUsername } = useAuth()
  const [customNick, setCustomNick] = useState("")
  const { toast } = useToast()
  const { lang, t } = useTranslation()

  useEffect(() => {
    async function loadProducts() {
      const data = await getProductsAction();
      setProducts(data as Product[]);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) => p.category === activeCategory)
  const effectiveUsername = minecraftUsername || customNick

  const getTranslatedCategoryKey = (cat: string) => {
    switch (cat) {
      case "RANKLAR": return "ranklar"
      case "KEYS-LAR": return "keyslar"
      case "VALYUTA": return "valyuta"
      case "UNBAN/UNMUTE": return "unban"
      default: return "ranklar"
    }
  }

  const generatePurchaseMessage = (product: Product) => {
    let itemName = lang === "ru" && product.name_ru ? product.name_ru : (lang === "en" && product.name_en ? product.name_en : product.name)
    let itemType = ""

    if (product.type === "rank") {
      itemType = lang === "uz" ? "RANKNI" : lang === "ru" ? "РАНГ" : "RANK"
    } else if (product.type === "unban") {
      itemName = "UNBAN"
      itemType = lang === "uz" ? "UNBANNI" : lang === "ru" ? "РАЗБАН" : "UNBAN"
    } else if (product.type === "unmute") {
      itemName = "UNMUTE"
      itemType = lang === "uz" ? "UNMUTENI" : lang === "ru" ? "РАЗМУТ" : "UNMUTE"
    } else if (product.type === "token") {
      const quantity = tokenQuantity ? ` (${tokenQuantity})` : ""
      itemName = `TOKEN${quantity}`
      itemType = lang === "uz" ? "TOKENNI" : lang === "ru" ? "ТОКЕН" : "TOKEN"
    } else if (product.type === "key") {
      itemName = itemName.toUpperCase()
      itemType = lang === "uz" ? `${itemName}NI` : lang === "ru" ? "КЕЙС" : "CRATE"
    }

    if (lang === "ru") {
      return `ПРИВЕТ, Я ХОТЕЛ КУПИТЬ ${itemType} ${itemName} НА ВАШЕМ СЕРВЕРЕ. МОЙ НИК: ${effectiveUsername || "НИК"} .`
    } else if (lang === "en") {
      return `HELLO, I WANT TO PURCHASE ${itemType} ${itemName} ON YOUR SERVER. MY NICKNAME: ${effectiveUsername || "NICKNAME"} .`
    }
    return `SALOM MEN SIZNING SERVERINGIZDA ${itemName} SHU ${itemType} OLMOQCHI EDIM SERVERDAGI NIKIM ${effectiveUsername || "NIKI"} .`
  }

  const handlePurchaseClick = (product: Product) => {
    if (!uid) {
      toast({
        title: lang === "uz" ? "Kirish kerak!" : lang === "ru" ? "Требуется вход!" : "Authentication required!",
        description: lang === "uz" ? "Mahsulot sotib olish uchun avval tizimga kiring." : lang === "ru" ? "Чтобы купить товар, сначала войдите в систему." : "Please log in to make a purchase.",
        variant: "destructive",
      })
      return
    }

    if (product.type === "token") {
      setTokenQuantity("")
    }

    setSelectedProduct(product)
    setIsPurchaseDialogOpen(true)
    setIsCopied(false)
  }

  const handleCopyAndTelegram = async () => {
    if (!selectedProduct) return

    if (!effectiveUsername.trim()) {
      toast({
        title: lang === "uz" ? "Nik kiriting!" : lang === "ru" ? "Введите ник!" : "Enter nickname!",
        description: lang === "uz" ? "Minecraft nikingizni kiriting." : lang === "ru" ? "Введите ваш ник в Minecraft." : "Please enter your Minecraft nickname.",
        variant: "destructive",
      })
      return
    }

    if (selectedProduct.type === "token" && !tokenQuantity) {
      toast({
        title: lang === "uz" ? "Miqdor kiriting!" : lang === "ru" ? "Введите количество!" : "Enter amount!",
        description: lang === "uz" ? "Token miqdorini belgilang." : lang === "ru" ? "Укажите количество токенов." : "Please specify the token amount.",
        variant: "destructive",
      })
      return
    }

    // Auto-link custom nickname to profile in Firebase if not already linked
    if (uid && !minecraftUsername && customNick.trim()) {
      try {
        await updateMinecraftUsername(uid, customNick)
        setMinecraftUsername(customNick.trim())
      } catch (error) {
        console.error("Auto linking failed", error)
      }
    }

    const message = generatePurchaseMessage(selectedProduct)

    navigator.clipboard.writeText(message).then(() => {
      setIsCopied(true)

      setTimeout(() => {
        window.open("https://t.me/NeoTerraAdmin", "_blank")
      }, 500)

      setTimeout(() => {
        setIsPurchaseDialogOpen(false)
        setIsCopied(false)
        setTokenQuantity("")
      }, 1500)
    })
  }

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="flex flex-col items-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-10 text-center">
          {lang === "uz" ? (
            <>SERVER <span className="text-primary liquid-shadow">DO'KONI</span></>
          ) : lang === "ru" ? (
            <>МАГАЗИН <span className="text-primary liquid-shadow">СЕРВЕРА</span></>
          ) : (
            <>SERVER <span className="text-primary liquid-shadow">STORE</span></>
          )}
        </h2>

        <div className="flex flex-wrap justify-center gap-2 p-2 glass-effect rounded-[2.5rem]">
          {CATEGORIES.map((cat) => {
            const key = getTranslatedCategoryKey(cat);
            // Translate categories safely by using t with section shop and accessing keyslar, ranklar, valyuta, unban
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-8 py-3 rounded-full text-xs font-black transition-all duration-500",
                  activeCategory === cat
                    ? "bg-white text-black shadow-xl"
                    : "text-white/40 hover:text-white hover:bg-white/5",
                )}
              >
                {lang === "uz" ? (
                  cat === "RANKLAR" ? "RANKLAR" : cat === "KEYS-LAR" ? "KEYS-LAR" : cat === "VALYUTA" ? "VALYUTA" : "UNBAN/UNMUTE"
                ) : lang === "ru" ? (
                  cat === "RANKLAR" ? "ПРИВИЛЕГИИ" : cat === "KEYS-LAR" ? "КЕЙСЫ" : cat === "VALYUTA" ? "ВАЛЮТА" : "РАЗБАН/РАЗМУТ"
                ) : (
                  cat === "RANKLAR" ? "RANKS" : cat === "KEYS-LAR" ? "CRATES" : cat === "VALYUTA" ? "CURRENCY" : "UNBAN/UNMUTE"
                )}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/50 font-bold uppercase tracking-widest animate-pulse">
          {lang === "uz" ? "Donatlar yuklanmoqda..." : lang === "ru" ? "Загрузка товаров..." : "Loading store products..."}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-white/40 font-bold uppercase tracking-widest border border-dashed border-white/5 rounded-[2.5rem] bg-white/5 backdrop-blur-xs">
          {t("shop", "noProducts")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const displayName = lang === "ru" && product.name_ru ? product.name_ru : (lang === "en" && product.name_en ? product.name_en : product.name)
            const displayDesc = lang === "ru" && product.description_ru ? product.description_ru : (lang === "en" && product.description_en ? product.description_en : product.description)
            return (
              <div
                key={product.id}
                className="group relative glass-effect rounded-[2.5rem] p-8 flex flex-col justify-between transition-all duration-700 hover:scale-[1.02] hover:bg-white/[0.08] overflow-hidden"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div>
                  <div className="mb-6 group-hover:scale-110 transition-transform duration-700 ease-out flex justify-center drop-shadow-2xl h-24 relative">
                    {product.image ? (
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={displayName}
                        width={96}
                        height={96}
                        className="object-contain filter brightness-0 drop-shadow-[0_0_8px_rgba(186,85,211,0.6)]"
                        style={{
                          filter:
                            "drop-shadow(0 0 12px rgba(186, 85, 211, 0.5)) drop-shadow(0 0 4px rgba(255, 20, 147, 0.3))",
                        }}
                      />
                    ) : (
                      <div className="text-7xl">📦</div>
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-white text-center mb-4 tracking-tight uppercase italic liquid-shadow">
                    {displayName}
                  </h3>
                </div>

                <div className="flex flex-col items-center gap-4 mt-8 w-full">
                  <span className="text-3xl font-bold text-white tracking-tighter">{product.price}</span>
                  
                  <div className="flex flex-col gap-2.5 w-full">
                    {displayDesc && (
                      <Button
                        onClick={() => {
                          setDetailProduct(product);
                          setIsDetailDialogOpen(true);
                        }}
                        variant="outline"
                        className="w-full border-white/10 hover:border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold rounded-[1.5rem] py-6 text-sm transition-transform active:scale-95"
                      >
                        {t("shop", "details").toUpperCase()}
                      </Button>
                    )}

                    <Button
                      onClick={() => handlePurchaseClick(product)}
                      className="w-full bg-white text-black hover:bg-white/90 font-black rounded-[1.5rem] py-6 text-md transition-transform active:scale-95"
                    >
                      {t("shop", "buy").toUpperCase()}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Details Dialog */}
      <ProductDialog
        product={detailProduct}
        isOpen={isDetailDialogOpen}
        onClose={() => {
          setIsDetailDialogOpen(false);
          setDetailProduct(null);
        }}
        onPurchase={(product) => {
          handlePurchaseClick(product);
        }}
      />

      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white text-center">{t("shop", "checkoutTitle").toUpperCase()}</DialogTitle>
            <DialogDescription className="text-muted-foreground text-center">
              {t("shop", "paymentMethod")}:
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 p-1 bg-white/5 rounded-xl mt-2 border border-white/10">
            <button
              onClick={() => setPaymentType("telegram")}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                paymentType === "telegram" ? "bg-primary text-white" : "text-white/60 hover:text-white"
              )}
            >
              Telegram
            </button>
            <button
              onClick={() => setPaymentType("auto")}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                paymentType === "auto" ? "bg-white text-black" : "text-white/60 hover:text-white"
              )}
            >
              <CreditCard className="size-4" /> {lang === "uz" ? "Avto To'lov" : lang === "ru" ? "Авто Оплата" : "Auto Pay"}
            </button>
          </div>

          {selectedProduct && paymentType === "telegram" && (
            <div className="flex flex-col gap-4 mt-2">
              {!minecraftUsername && (
                <div className="bg-zinc-950/40 p-4 rounded-lg border border-white/10">
                  <label className="text-white text-xs mb-2 block font-black uppercase tracking-wider">{t("shop", "enterNickname")}:</label>
                  <Input
                    type="text"
                    value={customNick}
                    onChange={(e) => setCustomNick(e.target.value)}
                    placeholder={t("shop", "nicknamePlaceholder")}
                    className="w-full bg-black/30 text-white border-white/10 rounded-lg"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    {lang === "uz"
                      ? "Bu nik avtomatik tarzda profil sozlamalaringizga saqlanadi."
                      : lang === "ru"
                      ? "Этот ник будет автоматически сохранен в настройках вашего профиля."
                      : "This nickname will be automatically saved in your profile settings."
                    }
                  </span>
                </div>
              )}

              {selectedProduct.type === "token" && (
                <div className="bg-zinc-950/40 p-4 rounded-lg border border-white/10">
                  <label className="text-white text-xs mb-2 block font-black uppercase tracking-wider">
                    {lang === "uz" ? "Token miqdorini kiriting:" : lang === "ru" ? "Введите количество токенов:" : "Enter token quantity:"}
                  </label>
                  <input
                    type="number"
                    value={tokenQuantity}
                    onChange={(e) => setTokenQuantity(e.target.value)}
                    placeholder="Masalan: 1000"
                    className="w-full bg-black/30 text-white border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/60"
                  />
                </div>
              )}

              <div className="bg-zinc-950/40 p-4 rounded-lg border border-white/10">
                <p className="text-white text-sm leading-relaxed">{generatePurchaseMessage(selectedProduct)}</p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCopyAndTelegram}
                  className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-6 flex items-center gap-2"
                >
                  {isCopied ? (
                    <>
                      <Check className="size-5" />
                      {lang === "uz" ? "NUSXA OLINDI" : lang === "ru" ? "СКОПИРОВАНО" : "COPIED"}
                    </>
                  ) : (
                    <>
                      <Copy className="size-5" />
                      {lang === "uz" ? "NUSXA OLIB TELEGRAMGA O'TISH" : lang === "ru" ? "СКОПИРОВАТЬ И ПЕРЕЙТИ В ТЕЛЕГРАМ" : "COPY AND GO TO TELEGRAM"}
                    </>
                  )}
                </Button>

                <a
                  href="https://t.me/NeoTerraAdmin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="size-4" />
                  Telegram: @NeoTerraAdmin
                </a>
              </div>
            </div>
          )}

          {selectedProduct && paymentType === "auto" && (
            <div className="flex flex-col gap-4 mt-2">
              <div className="glass-effect p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center py-10 gap-4">
                <AlertCircle className="size-12 text-primary animate-pulse" />
                <h4 className="text-xl font-bold text-white">
                  {lang === "uz" ? "TEZ KUNDA..." : lang === "ru" ? "СКОРО..." : "COMING SOON..."}
                </h4>
                <p className="text-white/60 text-sm">
                  {lang === "uz"
                    ? "Click va Payme orqali avtomatik to'lov tizimi ishlab chiqilmoqda. Hozircha \"Telegram\" usulidan foydalaning."
                    : lang === "ru"
                    ? "Автоматическая платежная система через Click и Payme находится в разработке. Пожалуйста, используйте метод \"Telegram\"."
                    : "Automatic payment system via Click and Payme is under development. Please use the \"Telegram\" option for now."
                  }
                </p>
                <div className="flex gap-4 mt-4 opacity-50">
                  <div className="bg-[#00a1ea] px-4 py-2 rounded-md text-white font-bold tracking-widest">CLICK</div>
                  <div className="bg-[#33cccc] px-4 py-2 rounded-md text-white font-bold tracking-widest">PAYME</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

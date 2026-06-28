"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tag, ShieldAlert, BadgeDollarSign, ShoppingBag } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";

interface ProductItem {
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

interface ProductDialogProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (product: ProductItem) => void;
}

export function ProductDialog({ product, isOpen, onClose, onPurchase }: ProductDialogProps) {
  const { lang, t } = useTranslation();
  if (!product) return null;

  const displayName = lang === "ru" && product.name_ru ? product.name_ru : (lang === "en" && product.name_en ? product.name_en : product.name);
  const displayDesc = lang === "ru" && product.description_ru ? product.description_ru : (lang === "en" && product.description_en ? product.description_en : product.description);

  const getCategoryIcon = () => {
    switch (product.type) {
      case "rank":
        return <ShieldAlert className="size-4 text-purple-400" />;
      case "token":
        return <BadgeDollarSign className="size-4 text-yellow-400" />;
      default:
        return <ShoppingBag className="size-4 text-primary" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-w-[calc(100%-2rem)] border-white/10 bg-zinc-950/90 backdrop-blur-3xl text-white rounded-[2rem] p-0 overflow-hidden shadow-2xl">
        <div className="grid md:grid-cols-12 gap-0 min-h-[450px]">
          {/* Left Column: Product Image */}
          <div className="md:col-span-5 relative min-h-[250px] md:min-h-full overflow-hidden flex items-center justify-center bg-black/30 p-10">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
            
            {product.image ? (
              <img
                src={product.image}
                alt={displayName}
                className="max-h-[200px] w-auto object-contain filter drop-shadow-[0_0_20px_rgba(186,85,211,0.4)]"
                style={{
                  filter: "drop-shadow(0 0 25px rgba(186, 85, 211, 0.45)) drop-shadow(0 0 10px rgba(255, 20, 147, 0.25))",
                }}
              />
            ) : (
              <div className="text-8xl">📦</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-950/90 via-transparent to-transparent" />
            
            {/* Tag/Category */}
            <div className="absolute top-6 left-6 bg-primary/95 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full flex items-center gap-2">
              {getCategoryIcon()}
              {product.category}
            </div>
          </div>

          {/* Right Column: Product details */}
          <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-between">
            <div>
              <DialogHeader className="mb-6">
                <DialogTitle className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter leading-tight liquid-shadow text-left">
                  {displayName}
                </DialogTitle>
              </DialogHeader>

              {/* Scrollable Description */}
              <div className="max-h-[30vh] md:max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar text-left">
                {displayDesc ? (
                  <div className="text-zinc-300 text-sm leading-relaxed font-medium whitespace-pre-wrap break-words bg-white/5 border border-white/5 p-5 rounded-2xl">
                    {displayDesc}
                  </div>
                ) : (
                  <div className="text-zinc-500 text-sm italic font-medium">
                    {lang === "uz" ? "Ushbu donat uchun qo'shimcha tavsif yozilmagan." : lang === "ru" ? "Для этого доната нет дополнительного описания." : "No additional description available for this donate item."}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">{t("shop", "price")}</span>
                <span className="text-2xl font-black text-white tracking-tight">{product.price}</span>
              </div>
              
              <Button
                onClick={() => {
                  onClose();
                  onPurchase(product);
                }}
                className="w-full sm:w-auto bg-white text-black hover:bg-white/90 font-black rounded-xl py-6 px-10 text-md transition-transform active:scale-95"
              >
                {t("shop", "buy").toUpperCase()}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

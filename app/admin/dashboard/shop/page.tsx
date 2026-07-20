"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, ShoppingBag, Edit2, Layers } from "lucide-react";
import { toast } from "sonner";
import { getProductsAction, createProductAction, deleteProductAction, updateProductAction } from "@/app/actions/products";
import { ImageUploader } from "@/components/admin/ImageUploader";

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
  command?: string;
}

const CATEGORIES = ["RANKLAR", "KEYS-LAR", "VALYUTA", "UNBAN/UNMUTE"];
const TYPES = [
  { value: "rank", label: "Rank (Masalan: VIP, Legend)" },
  { value: "key", label: "Key (Masalan: Keys-lar)" },
  { value: "token", label: "Token (Valyuta)" },
  { value: "unban", label: "Unban (Unban/Unmute)" },
  { value: "unmute", label: "Unmute (Unban/Unmute)" },
];

export default function AdminShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Image states
  const [addImageValue, setAddImageValue] = useState<string | null>(null);
  const [editImageValue, setEditImageValue] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setIsLoading(true);
    const data = await getProductsAction();
    setProducts(data as Product[]);
    setIsLoading(false);
  }

  async function handleAddProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await createProductAction(formData);

    if (result.success) {
      toast.success("Mahsulot muvaffaqiyatli qo'shildi!");
      setIsDialogOpen(false);
      fetchProducts();
    } else {
      toast.error(result.message);
    }
    setIsSubmitLoading(false);
  }

  async function handleEditProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProduct) return;
    setIsSubmitLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await updateProductAction(editingProduct.id, formData);

    if (result.success) {
      toast.success("Mahsulot muvaffaqiyatli tahrirlandi!");
      setIsEditOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } else {
      toast.error(result.message || "Tahrirlashda xatolik yuz berdi");
    }
    setIsSubmitLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Haqiqatan ham ushbu donat mahsulotini o'chirmoqchimisiz?")) return;

    const result = await deleteProductAction(id);
    if (result.success) {
      toast.success("Mahsulot o'chirildi");
      fetchProducts();
    } else {
      toast.error(result.message);
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setEditImageValue(product.image || null);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Do'kon Boshqaruvi
          </h1>
          <p className="text-zinc-400">Server do'konidagi donatlarni qo'shing, o'chiring yoki tartiblang.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 font-bold gap-2">
              <Plus className="h-4 w-4" /> Yangi Donat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto border-white/10 bg-zinc-950/80 backdrop-blur-2xl rounded-[2.5rem] text-white">
            <DialogHeader className="relative">
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />
              <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter liquid-shadow relative z-10">
                YANGI <span className="text-primary italic">DONAT</span>
              </DialogTitle>
              <DialogDescription className="text-zinc-400 font-medium">
                Do'konga yangi donat mahsulotini qo'shish ma'lumotlarini to'ldiring.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-5 pt-4 relative z-10">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Donat nomi (UZ)</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Masalan: IMMORTAL"
                  className="border-white/10 focus-visible:ring-primary h-12 bg-white/5 rounded-2xl text-white font-bold placeholder:text-zinc-700 transition-all focus:bg-white/10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name_ru" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Donat nomi (RU)</Label>
                <Input
                  id="name_ru"
                  name="name_ru"
                  placeholder="Masalan: IMMORTAL"
                  className="border-white/10 focus-visible:ring-primary h-12 bg-white/5 rounded-2xl text-white font-bold placeholder:text-zinc-700 transition-all focus:bg-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name_en" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Donat nomi (EN)</Label>
                <Input
                  id="name_en"
                  name="name_en"
                  placeholder="Masalan: IMMORTAL"
                  className="border-white/10 focus-visible:ring-primary h-12 bg-white/5 rounded-2xl text-white font-bold placeholder:text-zinc-700 transition-all focus:bg-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Donat imkoniyatlari / Tavsifi (UZ)</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Imkoniyatlarni qatorma-qator yozing, masalan:&#10;- Fly uchish huquqi&#10;- 5 ta uylar soni&#10;- Har oy 10,000 tanga"
                  className="w-full min-h-[80px] border border-white/10 focus:ring-1 focus:ring-primary bg-white/5 rounded-2xl text-white font-bold placeholder:text-zinc-700 transition-all focus:bg-white/10 p-3 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_ru" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Donat imkoniyatlari / Tavsifi (RU)</Label>
                <textarea
                  id="description_ru"
                  name="description_ru"
                  placeholder="Напишите возможности построчно, например:&#10;- Право на полет Fly&#10;- 5 точек дома&#10;- 10,000 коинов каждый месяц"
                  className="w-full min-h-[80px] border border-white/10 focus:ring-1 focus:ring-primary bg-white/5 rounded-2xl text-white font-bold placeholder:text-zinc-700 transition-all focus:bg-white/10 p-3 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_en" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Donat imkoniyatlari / Tavsifi (EN)</Label>
                <textarea
                  id="description_en"
                  name="description_en"
                  placeholder="Write perks line-by-line, for example:&#10;- Fly ability&#10;- 5 home locations&#10;- 10,000 coins monthly"
                  className="w-full min-h-[80px] border border-white/10 focus:ring-1 focus:ring-primary bg-white/5 rounded-2xl text-white font-bold placeholder:text-zinc-700 transition-all focus:bg-white/10 p-3 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Narxi (UZS)</Label>
                  <Input
                    id="price"
                    name="price"
                    placeholder="Masalan: 70,000 UZS"
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold placeholder:text-zinc-700 transition-all focus:bg-white/10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Tartib (Order)</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    defaultValue={products.length + 1}
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold transition-all focus:bg-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Kategoriya</Label>
                  <Select name="category" defaultValue="RANKLAR">
                    <SelectTrigger className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold focus:ring-primary focus:bg-white/10 transition-all">
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="focus:bg-primary/20 focus:text-white rounded-lg m-1 cursor-pointer">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Turi (Type)</Label>
                  <Select name="type" defaultValue="rank">
                    <SelectTrigger className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold focus:ring-primary focus:bg-white/10 transition-all">
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                      {TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value} className="focus:bg-primary/20 focus:text-white rounded-lg m-1 cursor-pointer">
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ImageUploader
                name="imageUrl"
                value={addImageValue}
                onChange={setAddImageValue}
                label="Rasm (Fayl yoki URL)"
              />
              <p className="text-[9px] text-zinc-600 ml-1 -mt-1">Tayyor rasmlar: /images/[light-blue, pink, red, yellow, blue, green, orange, donate-case, kit-case].jpg</p>

              <div className="space-y-2">
                <Label htmlFor="command" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Minecraft Buyruq (Server Konsolida)</Label>
                <textarea
                  id="command"
                  name="command"
                  placeholder="Masalan: lp user {username} parent add vip&#10;&#10;{username} — sotib olgan o'yinchining niki bilan almashtiriladi"
                  className="w-full min-h-[80px] border border-white/10 focus:ring-1 focus:ring-primary bg-white/5 rounded-2xl text-white font-bold placeholder:text-zinc-700 transition-all focus:bg-white/10 p-3 text-sm focus:outline-none font-mono"
                />
                <p className="text-[9px] text-zinc-600 ml-1">Bir nechta buyruq bo'lsa har birini yangi qatordan yozing. {'{username}'} — o'yinchi nikidir.</p>
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit" disabled={isSubmitLoading} className="w-full h-14 bg-primary hover:bg-primary/90 font-black tracking-widest italic rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                  {isSubmitLoading ? "QO'SHILMOQDA..." : "DONATNI QO'SHISH"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-zinc-500 font-bold uppercase tracking-widest">
            Yuklanmoqda...
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full py-20 text-center text-zinc-500 font-bold uppercase tracking-widest bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800">
            Do'konda hozircha hech qanday donat mahsulotlari qo'shilmagan.
          </div>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="bg-zinc-900 border-zinc-800 overflow-hidden group relative">
              <CardHeader className="pb-4 relative">
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={() => openEditDialog(product)}
                    className="p-2 rounded-full bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-500 font-bold">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-8 w-8 object-contain" />
                    ) : (
                      <ShoppingBag className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-white">{product.name}</CardTitle>
                    <CardDescription className="text-purple-400 font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                      <span>{product.category}</span>
                      <span className="text-zinc-700">•</span>
                      <span>Order: {product.order}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {product.description && (
                  <div className="text-xs text-zinc-400 border-t border-zinc-800 pt-3">
                    <span className="text-[10px] uppercase font-bold text-zinc-600 block mb-1">Tavsif (UZ):</span>
                    <p className="whitespace-pre-line line-clamp-3">{product.description}</p>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/40">
                  <span className="text-zinc-500 text-xs font-bold uppercase">Narxi</span>
                  <span className="text-lg font-bold text-white">{product.price}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog Modal */}
      {editingProduct && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto border-white/10 bg-zinc-950/80 backdrop-blur-2xl rounded-[2.5rem] text-white">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">
                DONATNI <span className="text-purple-500">TAHRIRLASH</span>
              </DialogTitle>
              <DialogDescription className="text-zinc-400 font-medium">
                Donat mahsuloti ma'lumotlarini o'zgartiring va saqlang.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditProduct} className="space-y-5 pt-4 relative z-10">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Donat nomi (UZ)</Label>
                <Input
                  name="name"
                  defaultValue={editingProduct.name}
                  placeholder="Masalan: IMMORTAL"
                  className="border-white/10 focus-visible:ring-primary h-12 bg-white/5 rounded-2xl text-white font-bold"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Donat nomi (RU)</Label>
                <Input
                  name="name_ru"
                  defaultValue={editingProduct.name_ru || ""}
                  placeholder="Masalan: IMMORTAL"
                  className="border-white/10 focus-visible:ring-primary h-12 bg-white/5 rounded-2xl text-white font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Donat nomi (EN)</Label>
                <Input
                  name="name_en"
                  defaultValue={editingProduct.name_en || ""}
                  placeholder="Masalan: IMMORTAL"
                  className="border-white/10 focus-visible:ring-primary h-12 bg-white/5 rounded-2xl text-white font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Donat imkoniyatlari / Tavsifi (UZ)</Label>
                <textarea
                  name="description"
                  defaultValue={editingProduct.description || ""}
                  placeholder="Imkoniyatlarni qatorma-qator yozing..."
                  className="w-full min-h-[80px] border border-white/10 focus:ring-1 focus:ring-primary bg-white/5 rounded-2xl text-white font-bold p-3 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Donat imkoniyatlari / Tavsifi (RU)</Label>
                <textarea
                  name="description_ru"
                  defaultValue={editingProduct.description_ru || ""}
                  placeholder="Напишите возможности построчно..."
                  className="w-full min-h-[80px] border border-white/10 focus:ring-1 focus:ring-primary bg-white/5 rounded-2xl text-white font-bold p-3 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Donat imkoniyatlari / Tavsifi (EN)</Label>
                <textarea
                  name="description_en"
                  defaultValue={editingProduct.description_en || ""}
                  placeholder="Write perks line-by-line..."
                  className="w-full min-h-[80px] border border-white/10 focus:ring-1 focus:ring-primary bg-white/5 rounded-2xl text-white font-bold p-3 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Minecraft Buyruq (Server Konsolida)</Label>
                <textarea
                  name="command"
                  defaultValue={editingProduct.command || ""}
                  placeholder="Masalan: lp user {username} parent add vip"
                  className="w-full min-h-[80px] border border-white/10 focus:ring-1 focus:ring-primary bg-white/5 rounded-2xl text-white font-bold p-3 text-sm focus:outline-none font-mono"
                />
                <p className="text-[9px] text-zinc-600 ml-1">Bir nechta buyruq bo'lsa har birini yangi qatordan yozing. {'{username}'} — o'yinchi nikidir.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Narxi (UZS)</Label>
                  <Input
                    name="price"
                    defaultValue={editingProduct.price}
                    placeholder="Masalan: 70,000 UZS"
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Tartib (Order)</Label>
                  <Input
                    name="order"
                    type="number"
                    defaultValue={editingProduct.order}
                    className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Kategoriya</Label>
                  <Select name="category" defaultValue={editingProduct.category}>
                    <SelectTrigger className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold">
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="focus:bg-primary/20 rounded-lg m-1 cursor-pointer">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Turi (Type)</Label>
                  <Select name="type" defaultValue={editingProduct.type}>
                    <SelectTrigger className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold">
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                      {TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value} className="focus:bg-primary/20 rounded-lg m-1 cursor-pointer">
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ImageUploader
                name="imageUrl"
                value={editImageValue}
                onChange={setEditImageValue}
                label="Rasm tahrirlash"
              />
              <p className="text-[9px] text-zinc-600 ml-1 -mt-1">Tayyor rasmlar: /images/[light-blue, pink, red, yellow, blue, green].jpg</p>

              <DialogFooter className="pt-4">
                <Button type="submit" disabled={isSubmitLoading} className="w-full h-14 bg-primary hover:bg-primary/90 font-black tracking-widest italic rounded-2xl shadow-lg shadow-primary/20">
                  {isSubmitLoading ? "SAQLANMOQDA..." : "O'ZGARISHLARNI SAQLASH"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

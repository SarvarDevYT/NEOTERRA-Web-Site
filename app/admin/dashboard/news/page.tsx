"use client";

import { useState, useEffect, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createNewsAction, deleteNewsAction, updateNewsAction } from "@/app/actions/news";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Newspaper, Plus, Trash2, Calendar, UserIcon, Edit2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface NewsItem {
  id: string;
  title: string;
  title_ru?: string;
  title_en?: string;
  content: string;
  content_ru?: string;
  content_en?: string;
  image: string | null;
  author: string | null;
  createdAt: string | null;
}

export default function NewsManagerPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageValue, setImageValue] = useState<string | null>(null);
  const [editImageValue, setEditImageValue] = useState<string | null>(null);
  const [state, formAction] = useActionState(createNewsAction, { error: "" });

  // Edit states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/news");
      if (res.ok) {
        const data = await res.json();
        setNews(data);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  }

  const openEditDialog = (item: NewsItem) => {
    setEditingItem(item);
    setEditImageValue(item.image);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsEditLoading(true);

    const formData = new FormData(e.currentTarget);
    // imageUrl is already injected by ImageUploader's hidden input
    const result = await updateNewsAction(editingItem.id, formData);

    if (result && result.error) {
      toast.error(result.error);
    } else {
      toast.success("Yangilik muvaffaqiyatli tahrirlandi!");
      setIsEditOpen(false);
      setEditingItem(null);
      fetchNews();
    }
    setIsEditLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Yangiliklar</h1>
          <p className="text-zinc-400 mt-1">
            Saytdagi barcha yangiliklarni boshqaring.
          </p>
        </div>

        <Button
          onClick={fetchNews}
          disabled={isLoading}
          variant="outline"
          className="border-white/10 text-white hover:bg-white/5 font-bold gap-2 rounded-xl"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Yangilash
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* News Creation Form */}
        <div className="lg:col-span-4">
          <Card className="border-zinc-800 bg-zinc-900 sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Plus className="h-5 w-5 text-purple-500" />
                Yangi Yangilik Qo'shish
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Barcha maydonlarni to'ldiring.
              </CardDescription>
            </CardHeader>
            <form action={formAction}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input 
                    name="title" 
                    placeholder="Sarlavha (UZ)" 
                    className="border-zinc-800 bg-zinc-950 text-white" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Input 
                    name="title_ru" 
                    placeholder="Sarlavha (RU)" 
                    className="border-zinc-800 bg-zinc-950 text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <Input 
                    name="title_en" 
                    placeholder="Sarlavha (EN)" 
                    className="border-zinc-800 bg-zinc-950 text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <Input 
                    name="author" 
                    placeholder="Muallif (masalan: Admin)" 
                    className="border-zinc-800 bg-zinc-950 text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Sana (ixtiyoriy)
                  </label>
                  <Input 
                    name="date" 
                    type="date"
                    className="border-zinc-800 bg-zinc-950 text-white" 
                  />
                </div>

                {/* New ImageUploader */}
                <ImageUploader
                  name="imageUrl"
                  value={imageValue}
                  onChange={setImageValue}
                  label="Rasm (Fayl yoki URL)"
                />

                <div className="space-y-2">
                  <Textarea 
                    name="content" 
                    placeholder="Yangilik matni (UZ)..." 
                    className="h-24 border-zinc-800 bg-zinc-950 text-white" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Textarea 
                    name="content_ru" 
                    placeholder="Yangilik matni (RU)..." 
                    className="h-24 border-zinc-800 bg-zinc-950 text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <Textarea 
                    name="content_en" 
                    placeholder="Yangilik matni (EN)..." 
                    className="h-24 border-zinc-800 bg-zinc-950 text-white" 
                  />
                </div>
                {state?.error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {state.error}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                  Saqlash
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* News List */}
        <div className="lg:col-span-8 space-y-4">
          {news.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30">
              <Newspaper className="h-12 w-12 text-zinc-700 mb-4" />
              <p className="text-zinc-500 font-medium">Hali yangiliklar yo'q.</p>
            </div>
          ) : (
            news.map((item) => (
              <Card key={item.id} className="group border-zinc-800 bg-zinc-900/80 hover:bg-zinc-900 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {item.image && (
                      <div className="relative h-32 w-full sm:w-48 overflow-hidden rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                          {item.title}
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(item)}
                            className="text-zinc-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-full"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Haqiqatdan ham o'chirmoqchisiz?</AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-400">
                                  Ushbu yangilikni o'chirish qaytarib bo'lmaydi. Bu amalni tasdiqlaysizmi?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-zinc-800 text-white hover:bg-zinc-700 border-none">Bekor qilish</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={async () => {
                                    try {
                                      await deleteNewsAction(item.id);
                                      setNews(news.filter(n => n.id !== item.id));
                                      toast.success("Yangilik o'chirildi!");
                                    } catch (error) {
                                      console.error("Error deleting news:", error);
                                      toast.error("O'chirishda xatolik yuz berdi");
                                    }
                                  }}
                                  className="bg-red-600 text-white hover:bg-red-700"
                                >
                                  O'chirish
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <p className="text-zinc-400 line-clamp-2 text-sm whitespace-pre-wrap break-all">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "---"}
                        </div>
                        <div className="flex items-center gap-1">
                          <UserIcon className="h-3 w-3" />
                          {item.author || "Noma'lum"}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Edit Dialog Modal */}
      {editingItem && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-950/80 backdrop-blur-2xl rounded-[2.5rem] text-white">
            <DialogHeader>
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />
              <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">
                YANGILIKNI <span className="text-purple-500">TAHRIRLASH</span>
              </DialogTitle>
              <DialogDescription className="text-zinc-400 font-medium">
                Sarlavha, muallif yoki matnni o'zgartiring va saqlang.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Sarlavha (UZ)</label>
                <Input 
                  name="title" 
                  defaultValue={editingItem.title}
                  placeholder="Sarlavha (UZ)" 
                  className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Sarlavha (RU)</label>
                <Input 
                  name="title_ru" 
                  defaultValue={editingItem.title_ru || ""}
                  placeholder="Sarlavha (RU)" 
                  className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Sarlavha (EN)</label>
                <Input 
                  name="title_en" 
                  defaultValue={editingItem.title_en || ""}
                  placeholder="Sarlavha (EN)" 
                  className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Muallif</label>
                <Input 
                  name="author" 
                  defaultValue={editingItem.author || ""}
                  placeholder="Muallif (masalan: Admin)" 
                  className="border-white/10 h-12 bg-white/5 rounded-2xl text-white font-bold" 
                />
              </div>

              {/* ImageUploader for edit */}
              <ImageUploader
                name="imageUrl"
                value={editImageValue}
                onChange={setEditImageValue}
                label="Rasm tahrirlash"
              />

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Yangilik matni (UZ)</label>
                <Textarea 
                  name="content" 
                  defaultValue={editingItem.content}
                  placeholder="Yangilik matni (UZ)..." 
                  className="h-24 border-white/10 bg-white/5 rounded-2xl text-white font-bold" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Yangilik matni (RU)</label>
                <Textarea 
                  name="content_ru" 
                  defaultValue={editingItem.content_ru || ""}
                  placeholder="Yangilik matni (RU)..." 
                  className="h-24 border-white/10 bg-white/5 rounded-2xl text-white font-bold" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Yangilik matni (EN)</label>
                <Textarea 
                  name="content_en" 
                  defaultValue={editingItem.content_en || ""}
                  placeholder="Yangilik matni (EN)..." 
                  className="h-24 border-white/10 bg-white/5 rounded-2xl text-white font-bold" 
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={isEditLoading} className="w-full h-14 bg-primary hover:bg-primary/90 font-black tracking-widest italic rounded-2xl shadow-lg shadow-primary/20">
                  {isEditLoading ? "SAQLANMOQDA..." : "O'ZGARISHLARNI SAQLASH"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, User, Tag } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface NewsItem {
  id: number;
  title: string;
  title_ru?: string;
  title_en?: string;
  content: string;
  content_ru?: string;
  content_en?: string;
  image: string | null;
  author: string | null;
  createdAt: Date | string | null;
}

interface NewsDialogProps {
  news: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NewsDialog({ news, isOpen, onClose }: NewsDialogProps) {
  const { lang, t } = useTranslation();
  if (!news) return null;

  const displayTitle = lang === "ru" && news.title_ru ? news.title_ru : (lang === "en" && news.title_en ? news.title_en : news.title);
  const displayContent = lang === "ru" && news.content_ru ? news.content_ru : (lang === "en" && news.content_en ? news.content_en : news.content);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-w-[calc(100%-2rem)] border-white/10 bg-zinc-950/90 backdrop-blur-3xl text-white rounded-[2rem] p-0 overflow-hidden shadow-2xl">
        <div className="grid md:grid-cols-12 gap-0 min-h-[450px]">
          {/* Left Column: Image */}
          <div className="md:col-span-5 relative min-h-[250px] md:min-h-full overflow-hidden">
            <img
              src={news.image || "/neoterra-new-logo.jpg"}
              alt={displayTitle}
              className="absolute inset-0 w-full h-full object-contain p-6 bg-black/40"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-950/90 via-transparent to-transparent" />
            
            {/* Tag/Category */}
            <div className="absolute top-6 left-6 bg-primary/95 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full flex items-center gap-2">
              <Tag className="size-3" />
              {t("nav", "news")}
            </div>
          </div>

          {/* Right Column: Details & Text */}
          <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-between">
            <div>
              <DialogHeader className="mb-6">
                <div className="flex flex-wrap items-center gap-3 text-white/50 text-xs font-bold mb-3">
                  <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    <Calendar className="size-3.5 text-primary" />
                    {news.createdAt ? new Date(news.createdAt).toLocaleDateString() : "---"}
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    <User className="size-3.5 text-primary" />
                    {news.author || "Admin"}
                  </div>
                </div>
                <DialogTitle className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter leading-tight liquid-shadow text-left">
                  {displayTitle}
                </DialogTitle>
              </DialogHeader>

              {/* Scrollable Content */}
              <div className="max-h-[30vh] md:max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar text-left">
                <div className="text-zinc-300 text-sm leading-relaxed font-medium whitespace-pre-wrap break-words">
                  {displayContent}
                </div>
              </div>
            </div>

            {/* Bottom Brand Details */}
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">NeoTerra Official News</span>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse delay-75" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/20 animate-pulse delay-150" />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

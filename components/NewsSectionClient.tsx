"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, ArrowRight } from "lucide-react";
import { NewsDialog } from "@/components/news-dialog";
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
  createdAt: string | null;
}

interface NewsSectionClientProps {
  newsItems: NewsItem[];
}

export default function NewsSectionClient({ newsItems }: NewsSectionClientProps) {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const { lang, t } = useTranslation();

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          {lang === "uz" ? "Yangiliklar" : lang === "ru" ? "Новости" : "News"}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent ml-8" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {newsItems.map((item) => {
          const displayTitle = lang === "ru" && item.title_ru ? item.title_ru : (lang === "en" && item.title_en ? item.title_en : item.title);
          const displayContent = lang === "ru" && item.content_ru ? item.content_ru : (lang === "en" && item.content_en ? item.content_en : item.content);
          return (
            <Card 
              key={item.id} 
              className="group border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all hover:scale-[1.02] overflow-hidden flex flex-col"
            >
              {item.image && (
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={displayTitle}
                    className="object-cover w-full h-full transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                </div>
              )}
              <CardHeader className="p-6">
                <div className="flex items-center gap-2 text-xs text-primary mb-2 uppercase tracking-widest font-bold">
                  <Calendar className="h-3 w-3" />
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "---"}
                </div>
                <CardTitle className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                  {displayTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 flex flex-col flex-grow">
                <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed mb-6 flex-grow whitespace-pre-wrap break-all">
                  {displayContent}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 italic uppercase tracking-wider">
                    <User className="h-3 w-3" />
                    {item.author || "Admin"}
                  </div>
                  <button 
                    onClick={() => setSelectedNews(item)}
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:text-white transition-colors group/btn text-left"
                  >
                    {t("news", "readMore").toUpperCase()}
                    <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <NewsDialog
        news={selectedNews}
        isOpen={!!selectedNews}
        onClose={() => setSelectedNews(null)}
      />
    </section>
  );
}

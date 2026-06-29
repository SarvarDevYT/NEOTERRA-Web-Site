"use client";

import { useState } from "react";
import { Calendar, Tag, ArrowRight } from "lucide-react";
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

interface NewsClientProps {
  newsItems: NewsItem[];
}

export default function NewsClient({ newsItems }: NewsClientProps) {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const { lang, t } = useTranslation();

  return (
    <>
      <section className="container mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-16 text-center liquid-shadow">
          {lang === "uz" ? (
            <>YANGILIKLAR & <span className="text-primary">E'LONLAR</span></>
          ) : lang === "ru" ? (
            <>НОВОСТИ & <span className="text-primary">ОБЪЯВЛЕНИЯ</span></>
          ) : (
            <>NEWS & <span className="text-primary">ANNOUNCEMENTS</span></>
          )}
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {newsItems.length === 0 ? (
            <div className="col-span-full text-center py-20 text-white/50 text-xl italic">
              {t("news", "noNews")}
            </div>
          ) : (
            newsItems.map((news) => {
              const displayTitle = lang === "ru" && news.title_ru ? news.title_ru : (lang === "en" && news.title_en ? news.title_en : news.title);
              const displayContent = lang === "ru" && news.content_ru ? news.content_ru : (lang === "en" && news.content_en ? news.content_en : news.content);

              return (
                <div
                  key={news.id}
                  className="glass-effect rounded-[2.5rem] overflow-hidden group hover:bg-white/[0.08] transition-all duration-500 flex flex-col items-start border border-white/10"
                >
                  <div className="relative w-full h-56 bg-black/50 overflow-hidden">
                    <img
                      src={news.image || "/neoterra-new-logo.jpg"}
                      alt={displayTitle}
                      className="w-full h-full object-cover opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 font-black italic">
                      <Tag className="size-3" />
                      {news.author || "Admin"}
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-grow w-full">
                    <div className="flex items-center gap-2 text-white/50 text-sm font-medium mb-4">
                      <Calendar className="size-4" />
                      {news.createdAt ? new Date(news.createdAt).toLocaleDateString() : "---"}
                    </div>

                    <h3 className="text-2xl font-black text-white mb-4 italic uppercase tracking-tight leading-tight line-clamp-2">
                      {displayTitle}
                    </h3>

                    <p className="text-white/70 mb-8 font-medium leading-relaxed flex-grow line-clamp-4 whitespace-pre-wrap break-all">
                      {displayContent}
                    </p>

                    <button
                      onClick={() => setSelectedNews(news)}
                      className="flex items-center gap-2 mt-auto text-primary font-bold hover:text-white transition-colors group/btn cursor-pointer text-left"
                    >
                      {lang === "uz" ? "BATAFSIL O'QISH" : lang === "ru" ? "ПОДРОБНЕЕ" : "READ MORE"}
                      <ArrowRight className="size-4 group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <NewsDialog
        news={selectedNews}
        isOpen={!!selectedNews}
        onClose={() => setSelectedNews(null)}
      />
    </>
  );
}

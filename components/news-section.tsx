import { adminDb } from "@/lib/firebase-admin";
import NewsSectionClient from "./NewsSectionClient";

export async function NewsSection() {
  let serializedNews: any[] = [];

  if (adminDb) {
    try {
      const snapshot = await adminDb
        .collection("news")
        .orderBy("createdAt", "desc")
        .limit(3)
        .get();

      serializedNews = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "",
          title_ru: data.title_ru || "",
          title_en: data.title_en || "",
          content: data.content || "",
          content_ru: data.content_ru || "",
          content_en: data.content_en || "",
          image: data.image || null,
          author: data.author || null,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        };
      });
    } catch (e) {
      console.error("NewsSection fetch error:", e);
    }
  }

  if (serializedNews.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Yangiliklar
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent ml-8" />
      </div>

      <NewsSectionClient newsItems={serializedNews} />
    </section>
  );
}

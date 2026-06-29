import { adminDb } from "@/lib/firebase-admin";
import { Footer } from "@/components/footer";
import NewsClient from "@/app/news/NewsClient";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  let serializedNews: any[] = [];

  if (adminDb) {
    try {
      const snapshot = await adminDb
        .collection("news")
        .orderBy("createdAt", "desc")
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
      console.error("News fetch error:", e);
    }
  }

  return (
    <main className="min-h-screen bg-background pt-32">
      <NewsClient newsItems={serializedNews} />
      <Footer />
    </main>
  );
}

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
          content: data.content || "",
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
      <section className="container mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-16 text-center liquid-shadow">
          YANGILIKLAR & <span className="text-primary">E'LONLAR</span>
        </h1>

        <NewsClient newsItems={serializedNews} />
      </section>
      <Footer />
    </main>
  );
}

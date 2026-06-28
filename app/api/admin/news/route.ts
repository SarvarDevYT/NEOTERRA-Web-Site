import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!adminDb) {
    return NextResponse.json([]);
  }

  try {
    const snapshot = await adminDb
      .collection("news")
      .orderBy("createdAt", "desc")
      .get();

    const news = snapshot.docs.map((doc) => {
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

    return NextResponse.json(news);
  } catch (error) {
    console.error("News API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

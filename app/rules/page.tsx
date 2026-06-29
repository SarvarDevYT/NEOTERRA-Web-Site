import { adminDb } from "@/lib/firebase-admin";
import { Metadata } from "next";
import RulesClient from "./RulesClient";

export const metadata: Metadata = {
  title: "Server Qoidalari | NeoTerra",
  description: "NeoTerra serverining rasmiy o'yin qoidalari va yo'riqnomalari.",
};

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  let rules: any[] = [];

  if (adminDb) {
    try {
      const snapshot = await adminDb.collection("rules").orderBy("order", "asc").get();
      rules = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "",
          title_ru: data.title_ru || "",
          title_en: data.title_en || "",
          description: data.description || "",
          description_ru: data.description_ru || "",
          description_en: data.description_en || "",
          order: data.order || 0,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        };
      });
    } catch (e) {
      console.error("Rules fetch error:", e);
    }
  }

  const latestRule = rules.reduce((latest: Date | null, rule) => {
    if (!rule.updatedAt) return latest;
    const ruleDate = new Date(rule.updatedAt);
    if (!latest || ruleDate > latest) return ruleDate;
    return latest;
  }, null as Date | null);

  const displayDate = latestRule
    ? latestRule.toLocaleDateString()
    : new Date().toLocaleDateString();

  return <RulesClient initialRules={rules} displayDate={displayDate} />;
}

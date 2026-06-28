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
      rules = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate?.() || null,
      }));
    } catch (e) {
      console.error("Rules fetch error:", e);
    }
  }

  const latestRule = rules.reduce((latest: Date | null, rule) => {
    if (!rule.updatedAt) return latest;
    if (!latest || rule.updatedAt > latest) return rule.updatedAt;
    return latest;
  }, null as Date | null);

  const displayDate = latestRule
    ? latestRule.toLocaleDateString()
    : new Date().toLocaleDateString();

  return <RulesClient initialRules={rules} displayDate={displayDate} />;
}

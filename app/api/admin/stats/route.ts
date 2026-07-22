import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!adminDb) {
    return NextResponse.json({ news: 0, rules: 0, auth: 0, totalIncome: 0, inpayEnabled: true });
  }

  try {
    const [newsSnap, rulesSnap, usersSnap, paymentsSnap, settingsDoc] = await Promise.all([
      adminDb.collection("news").count().get(),
      adminDb.collection("rules").count().get(),
      adminDb.collection("users").count().get(),
      adminDb.collection("payments").where("status", "in", ["completed", "success", "paid"]).get(),
      adminDb.collection("settings").doc("system").get(),
    ]);

    let totalIncome = 0;
    paymentsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.amount && typeof data.amount === "number") {
        totalIncome += data.amount;
      }
    });

    const settingsData = settingsDoc.exists ? settingsDoc.data() : {};
    const inpayEnabled = settingsData?.inpayEnabled !== false;

    return NextResponse.json({
      news: newsSnap.data().count,
      rules: rulesSnap.data().count,
      auth: usersSnap.data().count,
      totalIncome: totalIncome,
      paymentsCount: paymentsSnap.size,
      inpayEnabled: inpayEnabled,
      inpayNoticeMessage: settingsData?.inpayNoticeMessage || "",
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

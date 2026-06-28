import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!adminDb) {
    return NextResponse.json({ news: 0, rules: 0, auth: 0 });
  }

  try {
    const [newsSnap, rulesSnap, usersSnap] = await Promise.all([
      adminDb.collection("news").count().get(),
      adminDb.collection("rules").count().get(),
      adminDb.collection("users").count().get(),
    ]);

    return NextResponse.json({
      news: newsSnap.data().count,
      rules: rulesSnap.data().count,
      auth: usersSnap.data().count,
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

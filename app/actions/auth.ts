"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function setAdminSession(idToken: string) {
  if (!adminAuth || !adminDb) {
    return { error: "Firebase Admin sozlanmagan!" };
  }

  try {
    // 1. Tokenni tekshirish
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // 2. Admin rolini tekshirish
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    const role = userDoc.data()?.role;

    // Qo'shimcha: birinchi ro'yxatdan o'tgan emailni admin qilish (fallback)
    const isAdmin = role === "admin" || role === "owner" || decodedToken.email === "admin@neoterra.uz";

    if (!isAdmin) {
      return { error: "Sizda admin ruxsati yo'q!" };
    }

    // 3. Cookie saqlash
    const cookieStore = await cookies();
    cookieStore.set("admin_session", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 kun
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    console.error("Admin session error:", error);
    return { error: "Sessiya yaratishda xato!" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin");
}

export async function isAuthenticated() {
  if (!adminAuth || !adminDb) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    const role = userDoc.data()?.role;
    return role === "admin" || role === "owner" || decodedToken.email === "admin@neoterra.uz";
  } catch {
    return false;
  }
}

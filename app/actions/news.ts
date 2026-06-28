"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FieldValue } from "firebase-admin/firestore";

export async function createNewsAction(prevState: any, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const title_ru = String(formData.get("title_ru") ?? "").trim();
  const content_ru = String(formData.get("content_ru") ?? "").trim();
  const title_en = String(formData.get("title_en") ?? "").trim();
  const content_en = String(formData.get("content_en") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const dateStr = formData.get("date") as string;

  // Accept imageUrl string (URL or base64) from ImageUploader hidden input
  const imageUrl = (formData.get("imageUrl") as string) || null;

  if (!title || !content) {
    return { error: "Sarlavha va matn to'ldirilishi shart." };
  }

  if (!adminDb) {
    return { error: "Firebase Admin sozlanmagan!" };
  }

  try {
    await adminDb.collection("news").add({
      title,
      content,
      title_ru: title_ru || null,
      content_ru: content_ru || null,
      title_en: title_en || null,
      content_en: content_en || null,
      image: imageUrl,
      author: author || null,
      createdAt: dateStr ? new Date(dateStr) : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error("createNewsAction error:", e);
    return { error: "Yangilik qo'shishda xatolik. Keyinroq urinib ko'ring." };
  }

  revalidatePath("/admin/dashboard/news");
  revalidatePath("/");
  redirect("/admin/dashboard/news");
}

export async function updateNewsAction(id: string, formData: FormData) {
  if (!adminDb) return { error: "Firebase Admin sozlanmagan!" };

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const title_ru = String(formData.get("title_ru") ?? "").trim();
  const content_ru = String(formData.get("content_ru") ?? "").trim();
  const title_en = String(formData.get("title_en") ?? "").trim();
  const content_en = String(formData.get("content_en") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();

  // Accept imageUrl string (URL or base64) from ImageUploader hidden input
  const imageUrl = (formData.get("imageUrl") as string) || null;

  if (!title || !content) {
    return { error: "Sarlavha va matn to'ldirilishi shart." };
  }

  try {
    await adminDb.collection("news").doc(id).update({
      title,
      content,
      title_ru: title_ru || null,
      content_ru: content_ru || null,
      title_en: title_en || null,
      content_en: content_en || null,
      image: imageUrl,
      author: author || null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath("/admin/dashboard/news");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("News update error:", error);
    return { error: error.message || "Yangilashda xatolik yuz berdi" };
  }
}

export async function deleteNewsAction(id: string) {
  if (!adminDb) return;
  await adminDb.collection("news").doc(id).delete();

  revalidatePath("/admin/dashboard/news");
  revalidatePath("/");
}

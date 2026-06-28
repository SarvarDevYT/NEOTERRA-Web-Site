"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";

export async function getRulesAction() {
  if (!adminDb) return [];
  try {
    const snapshot = await adminDb.collection("rules").orderBy("order", "asc").get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        description: data.description || "",
        title_ru: data.title_ru || null,
        description_ru: data.description_ru || null,
        title_en: data.title_en || null,
        description_en: data.description_en || null,
        order: data.order || 0,
      };
    });
  } catch (error) {
    console.error("Error getting rules:", error);
    return [];
  }
}

export async function createRuleAction(formData: FormData) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" };
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const title_ru = String(formData.get("title_ru") ?? "").trim();
  const description_ru = String(formData.get("description_ru") ?? "").trim();
  const title_en = String(formData.get("title_en") ?? "").trim();
  const description_en = String(formData.get("description_en") ?? "").trim();
  const order = parseInt(formData.get("order") as string) || 0;

  try {
    await adminDb.collection("rules").add({
      title,
      description,
      title_ru: title_ru || null,
      description_ru: description_ru || null,
      title_en: title_en || null,
      description_en: description_en || null,
      order,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath("/admin/dashboard/rules");
    revalidatePath("/rules");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating rule:", error);
    return { success: false, message: error.message };
  }
}

export async function updateRuleAction(id: string, formData: FormData) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" };
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const title_ru = String(formData.get("title_ru") ?? "").trim();
  const description_ru = String(formData.get("description_ru") ?? "").trim();
  const title_en = String(formData.get("title_en") ?? "").trim();
  const description_en = String(formData.get("description_en") ?? "").trim();
  const order = parseInt(formData.get("order") as string) || 0;

  try {
    await adminDb.collection("rules").doc(id).update({
      title,
      description,
      title_ru: title_ru || null,
      description_ru: description_ru || null,
      title_en: title_en || null,
      description_en: description_en || null,
      order,
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath("/admin/dashboard/rules");
    revalidatePath("/rules");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating rule:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteRuleAction(id: string) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" };
  try {
    await adminDb.collection("rules").doc(id).delete();

    revalidatePath("/admin/dashboard/rules");
    revalidatePath("/rules");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting rule:", error);
    return { success: false, message: error.message };
  }
}

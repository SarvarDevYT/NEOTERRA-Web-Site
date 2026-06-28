"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";

export async function getProductsAction() {
  if (!adminDb) return [];
  try {
    const snapshot = await adminDb.collection("products").orderBy("order", "asc").get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        name_ru: data.name_ru || "",
        name_en: data.name_en || "",
        price: data.price || "",
        category: data.category || "RANKLAR",
        type: data.type || "rank",
        image: data.image || "",
        order: data.order || 0,
        description: data.description || "",
        description_ru: data.description_ru || "",
        description_en: data.description_en || "",
      };
    });
  } catch (error) {
    console.error("Error getting products:", error);
    return [];
  }
}

export async function createProductAction(formData: FormData) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" };

  const name = String(formData.get("name") ?? "").trim();
  const name_ru = String(formData.get("name_ru") ?? "").trim();
  const name_en = String(formData.get("name_en") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const category = String(formData.get("category") ?? "RANKLAR");
  const type = String(formData.get("type") ?? "rank");
  // Accept both 'imageUrl' (from ImageUploader) and legacy 'image' field
  const image = String(formData.get("imageUrl") ?? formData.get("image") ?? "").trim();
  const order = parseInt(formData.get("order") as string) || 0;
  const description = String(formData.get("description") ?? "").trim();
  const description_ru = String(formData.get("description_ru") ?? "").trim();
  const description_en = String(formData.get("description_en") ?? "").trim();

  if (!name || !price) {
    return { success: false, message: "Nom va narx to'ldirilishi shart!" };
  }

  try {
    await adminDb.collection("products").add({
      name,
      name_ru,
      name_en,
      price,
      category,
      type,
      image,
      order,
      description,
      description_ru,
      description_en,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath("/admin/dashboard/shop");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    console.error("Product creation error:", error);
    return { success: false, message: error.message || "Xatolik yuz berdi" };
  }
}

export async function deleteProductAction(id: string) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" };

  try {
    await adminDb.collection("products").doc(id).delete();
    revalidatePath("/admin/dashboard/shop");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    console.error("Product deletion error:", error);
    return { success: false, message: error.message || "O'chirishda xatolik" };
  }
}

export async function updateProductAction(id: string, formData: FormData) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" };

  const name = String(formData.get("name") ?? "").trim();
  const name_ru = String(formData.get("name_ru") ?? "").trim();
  const name_en = String(formData.get("name_en") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const category = String(formData.get("category") ?? "RANKLAR");
  const type = String(formData.get("type") ?? "rank");
  // Accept both 'imageUrl' (from ImageUploader) and legacy 'image' field
  const image = String(formData.get("imageUrl") ?? formData.get("image") ?? "").trim();
  const order = parseInt(formData.get("order") as string) || 0;
  const description = String(formData.get("description") ?? "").trim();
  const description_ru = String(formData.get("description_ru") ?? "").trim();
  const description_en = String(formData.get("description_en") ?? "").trim();

  if (!name || !price) {
    return { success: false, message: "Nom va narx to'ldirilishi shart!" };
  }

  try {
    await adminDb.collection("products").doc(id).update({
      name,
      name_ru,
      name_en,
      price,
      category,
      type,
      image,
      order,
      description,
      description_ru,
      description_en,
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath("/admin/dashboard/shop");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    console.error("Product update error:", error);
    return { success: false, message: error.message || "Xatolik yuz berdi" };
  }
}

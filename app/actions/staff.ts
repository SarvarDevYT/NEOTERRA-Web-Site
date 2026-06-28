"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { writeFile } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

export async function getStaffAction() {
  if (!adminDb) return [];
  const snapshot = await adminDb.collection("staff").orderBy("order", "asc").get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      nickname: data.nickname || "",
      role: data.role || "",
      discord: data.discord || null,
      telegram: data.telegram || null,
      imageUrl: data.imageUrl || null,
      order: data.order || 0,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
    };
  });
}

export async function createStaffAction(formData: FormData) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" };

  const nickname = formData.get("nickname") as string;
  const role = formData.get("role") as string;
  const discord = formData.get("discord") as string;
  const telegram = formData.get("telegram") as string;
  const orderString = formData.get("order") as string;
  const order = parseInt(orderString) || 0;
  const imageFile = formData.get("image") as File | null;

  let imageUrl = null;
  if (imageFile && imageFile.size > 0) {
    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadDir = join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, "_")}`;
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;
    } catch (e) {
      console.error("Image upload error for staff:", e);
    }
  }

  try {
    await adminDb.collection("staff").add({
      nickname,
      role,
      discord: discord || null,
      telegram: telegram || null,
      imageUrl,
      order,
      createdAt: FieldValue.serverTimestamp(),
    });
    revalidatePath("/admin/dashboard/staff");
    revalidatePath("/staff");
    return { success: true };
  } catch (error) {
    console.error("Staff creation error:", error);
    return { success: false, message: "Xatolik yuz berdi" };
  }
}

export async function deleteStaffAction(id: string) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" };
  try {
    await adminDb.collection("staff").doc(id).delete();
    revalidatePath("/admin/dashboard/staff");
    revalidatePath("/staff");
    return { success: true };
  } catch (error) {
    console.error("Staff deletion error:", error);
    return { success: false, message: "O'chirishda xatolik" };
  }
}

export async function updateStaffAction(id: string, formData: FormData) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" };

  const nickname = formData.get("nickname") as string;
  const role = formData.get("role") as string;
  const discord = formData.get("discord") as string;
  const telegram = formData.get("telegram") as string;
  const orderString = formData.get("order") as string;
  const order = parseInt(orderString) || 0;
  const imageFile = formData.get("image") as File | null;
  const keepImage = formData.get("keepImage") === "true";

  const updateData: any = {
    nickname,
    role,
    discord: discord || null,
    telegram: telegram || null,
    order,
  };

  if (imageFile && imageFile.size > 0) {
    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadDir = join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, "_")}`;
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      updateData.imageUrl = `/uploads/${fileName}`;
    } catch (e) {
      console.error("Image upload error in updateStaffAction:", e);
    }
  } else if (!keepImage) {
    updateData.imageUrl = null;
  }

  try {
    await adminDb.collection("staff").doc(id).update(updateData);
    revalidatePath("/admin/dashboard/staff");
    revalidatePath("/staff");
    return { success: true };
  } catch (error) {
    console.error("Staff update error:", error);
    return { success: false, message: "Tahrirlashda xatolik yuz berdi" };
  }
}

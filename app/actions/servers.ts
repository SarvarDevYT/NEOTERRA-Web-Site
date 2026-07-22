"use server"

import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import { revalidatePath } from "next/cache"

export interface ServerData {
  id: string
  name: string
  displayName: string
  motd?: string
  onlinePlayers?: number
  maxPlayers?: number
  version?: string
  status: "online" | "offline"
  lastPing?: string
  order: number
  isActive: boolean
}

export async function getServersAction(): Promise<ServerData[]> {
  if (!adminDb) return []

  try {
    const snapshot = await adminDb.collection("servers")
      .where("isActive", "==", true)
      .get()

    const now = Date.now()

    return snapshot.docs.map(doc => {
      const data = doc.data()
      const lastPingTs = data.lastPingTimestamp || 0
      // 2 daqiqa (120000ms) ichida ping kelgan bo'lsa ONLINE
      const isOnline = lastPingTs > 0 && (now - lastPingTs < 120000)

      const status: "online" | "offline" = isOnline ? "online" : "offline"

      return {
        id: doc.id,
        name: data.name || doc.id,
        displayName: data.displayName || data.name || doc.id,
        motd: data.motd || "NeoTerra Minecraft Server",
        onlinePlayers: data.onlinePlayers || 0,
        maxPlayers: data.maxPlayers || 100,
        version: data.version || "1.21.3",
        status,
        lastPing: data.lastPing || null,
        order: data.order || 0,
        isActive: data.isActive !== false,
      }
    }).sort((a, b) => a.order - b.order)
  } catch (error: any) {
    console.error("getServersAction error:", error)
    return []
  }
}

export async function getAllServersAction(): Promise<ServerData[]> {
  if (!adminDb) return []

  try {
    const snapshot = await adminDb.collection("servers")
      .get()

    const now = Date.now()

    return snapshot.docs.map(doc => {
      const data = doc.data()
      const lastPingTs = data.lastPingTimestamp || 0
      const isOnline = lastPingTs > 0 && (now - lastPingTs < 120000)
      const status: "online" | "offline" = isOnline ? "online" : "offline"

      return {
        id: doc.id,
        name: data.name || doc.id,
        displayName: data.displayName || data.name || doc.id,
        motd: data.motd || "NeoTerra Minecraft Server",
        onlinePlayers: data.onlinePlayers || 0,
        maxPlayers: data.maxPlayers || 100,
        version: data.version || "1.21.3",
        status,
        lastPing: data.lastPing || null,
        order: data.order || 0,
        isActive: data.isActive !== false,
      }
    }).sort((a, b) => a.order - b.order)
  } catch (error: any) {
    console.error("getAllServersAction error:", error)
    return []
  }
}

export async function createServerAction(formData: FormData) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" }

  const id = String(formData.get("id") ?? "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "")
  const name = String(formData.get("name") ?? "").trim()
  const displayName = String(formData.get("displayName") ?? "").trim()
  const order = parseInt(formData.get("order") as string) || 0

  if (!id || !name) {
    return { success: false, message: "ID va nomi to'ldirilishi shart!" }
  }

  try {
    const existing = await adminDb.collection("servers").doc(id).get()
    if (existing.exists) {
      return { success: false, message: "Bu ID bilan server allaqachon mavjud!" }
    }

    await adminDb.collection("servers").doc(id).set({
      name,
      displayName,
      order,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    revalidatePath("/admin/dashboard/servers")
    return { success: true }
  } catch (error: any) {
    console.error("createServerAction error:", error)
    return { success: false, message: error.message || "Xatolik yuz berdi" }
  }
}

export async function updateServerAction(id: string, formData: FormData) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" }

  const name = String(formData.get("name") ?? "").trim()
  const displayName = String(formData.get("displayName") ?? "").trim()
  const order = parseInt(formData.get("order") as string) || 0
  const isActive = formData.get("isActive") === "true"

  if (!name) {
    return { success: false, message: "Server nomi to'ldirilishi shart!" }
  }

  try {
    const updateData: any = {
      name,
      displayName,
      order,
      isActive,
      updatedAt: FieldValue.serverTimestamp(),
    }

    await adminDb.collection("servers").doc(id).update(updateData)

    revalidatePath("/admin/dashboard/servers")
    return { success: true }
  } catch (error: any) {
    console.error("updateServerAction error:", error)
    return { success: false, message: error.message || "Xatolik yuz berdi" }
  }
}

export async function deleteServerAction(id: string) {
  if (!adminDb) return { success: false, message: "Firebase Admin sozlanmagan!" }

  try {
    await adminDb.collection("servers").doc(id).delete()
    revalidatePath("/admin/dashboard/servers")
    return { success: true }
  } catch (error: any) {
    console.error("deleteServerAction error:", error)
    return { success: false, message: error.message || "Xatolik yuz berdi" }
  }
}

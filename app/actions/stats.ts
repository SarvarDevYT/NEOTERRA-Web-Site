"use server"

import { adminDb } from "@/lib/firebase-admin"

export interface TopUser {
  uid: string
  minecraftUsername: string
  balance: number
  role?: string
  totalSpent?: number
}

export async function getTopPlayersAction() {
  if (!adminDb) return { topBalance: [], topSpent: [] }

  try {
    const balanceSnap = await adminDb.collection("users")
      .where("minecraftUsername", "!=", "")
      .orderBy("balance", "desc")
      .limit(10)
      .get()

    const topBalance = balanceSnap.docs.map(doc => {
      const data = doc.data()
      return {
        uid: doc.id,
        minecraftUsername: data.minecraftUsername || "Steve",
        balance: data.balance || 0,
        role: data.role || "Player",
      }
    })

    return { topBalance, topSpent: topBalance }
  } catch (error: any) {
    console.error("getTopPlayersAction error:", error)
    return { topBalance: [], topSpent: [] }
  }
}

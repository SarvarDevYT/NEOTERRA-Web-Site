"use server"

import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

export async function createInpayPaymentAction(
  productId: string,
  username: string,
  amount: number,
  tokenQty?: string,
  userUid?: string
) {
  if (!adminDb) {
    return { success: false, message: "Firebase is not configured!" }
  }

  const merchantId = process.env.INPAY_MERCHANT_ID
  const merchantToken = process.env.INPAY_MERCHANT_TOKEN

  if (!merchantId || !merchantToken) {
    return { success: false, message: "inPAY configuration keys are missing in .env!" }
  }

  try {
    // 1. Authorize to get Bearer Token
    const authUrl = `https://inpay.uz/api/v1/authorization/?merchant_id=${merchantId}&merchant_token=${merchantToken}`
    const authResponse = await fetch(authUrl, { cache: "no-store" })
    const authData = await authResponse.json()

    if (!authData.success || !authData.bearer_token) {
      return { success: false, message: authData.message || "Failed to authorize with inPAY!" }
    }

    const bearerToken = authData.bearer_token

    // 2. Create local payment entry in Firestore to generate local order ID
    const paymentRef = adminDb.collection("payments").doc()
    const localOrderId = paymentRef.id

    const description = productId === "balance_topup"
      ? `NeoTerra Balans To'ldirish: ${username}`
      : `Minecraft: ${productId} for ${username}${tokenQty ? ` (Qty: ${tokenQty})` : ""}`
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://site.neoterra.uz"
    const callbackUrl = `${baseUrl}/api/payment/inpay-webhook`

    // 3. Create payment invoice in inPAY
    const createUrl = "https://inpay.uz/api/v1/create/"
    const createResponse = await fetch(createUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        token: merchantToken,
        amount: amount,
        description: description,
        callback_url: callbackUrl,
        payment_method: "",
      }),
      cache: "no-store",
    })

    const createData = await createResponse.json()

    if (!createData.success || !createData.pay_url) {
      return { success: false, message: createData.message || "Failed to create invoice with inPAY!" }
    }

    // 4. Save details in Firestore
    await paymentRef.set({
      id: localOrderId,
      inpayOrderId: createData.order_id,
      productId: productId,
      username: username,
      amount: amount,
      tokenQty: tokenQty || null,
      userUid: userUid || null,
      status: "pending",
      description: description,
      payUrl: createData.pay_url,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return { success: true, payUrl: createData.pay_url }
  } catch (error: any) {
    console.error("inPAY payment creation error:", error)
    return { success: false, message: error.message || "Something went wrong" }
  }
}

export async function syncPendingInpayPaymentsAction() {
  if (!adminDb) return { success: false, message: "Database not configured" }

  try {
    const pendingSnap = await adminDb.collection("payments").where("status", "==", "pending").get()
    if (pendingSnap.empty) {
      return { success: true, message: "Kutish rejimidagi to'lovlar mavjud emas." }
    }

    let updatedCount = 0
    for (const doc of pendingSnap.docs) {
      const p = doc.data()
      // Update payment status
      await doc.ref.update({
        status: "success",
        updatedAt: FieldValue.serverTimestamp(),
      })

      // Credit user balance if it was a balance topup
      if (p.productId === "balance_topup" && p.userUid && p.amount) {
        const userRef = adminDb.collection("users").doc(p.userUid)
        await userRef.update({
          balance: FieldValue.increment(Number(p.amount)),
          updatedAt: FieldValue.serverTimestamp(),
        })
      }
      updatedCount++
    }

    return { success: true, message: `${updatedCount} ta to'lov sinxronizatsiya qilindi va balans to'ldirildi!` }
  } catch (error: any) {
    console.error("syncPendingInpayPaymentsAction error:", error)
    return { success: false, message: error.message || "Sinxronizatsiyada xatolik" }
  }
}

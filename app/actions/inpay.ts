"use server"

import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

import { getSystemSettingsAction } from "@/app/actions/system-settings"

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

  // Check system settings for InPay maintenance mode
  const sysSettings = await getSystemSettingsAction();
  if (!sysSettings.inpayEnabled) {
    return {
      success: false,
      message: sysSettings.inpayNoticeMessage || "InPay to'lov tizimida vaqtinchalik texnik profilaktika ishlari olib borilmoqda."
    }
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
    const receiptUrl = createData.order_id ? `https://inpay.uz/r/${createData.order_id}` : null

    await paymentRef.set({
      id: localOrderId,
      inpayOrderId: createData.order_id,
      paymentMethod: "INPAY",
      productId: productId,
      username: username,
      amount: amount,
      tokenQty: tokenQty || null,
      userUid: userUid || null,
      status: "pending",
      description: description,
      payUrl: createData.pay_url,
      receiptUrl: receiptUrl,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return { success: true, payUrl: createData.pay_url, receiptUrl }
  } catch (error: any) {
    console.error("inPAY payment creation error:", error)
    return { success: false, message: error.message || "Something went wrong" }
  }
}

export async function syncPendingInpayPaymentsAction() {
  if (!adminDb) return { success: false, message: "Database not configured" }

  const merchantId = process.env.INPAY_MERCHANT_ID
  const merchantToken = process.env.INPAY_MERCHANT_TOKEN

  try {
    const pendingSnap = await adminDb.collection("payments").where("status", "==", "pending").get()
    if (pendingSnap.empty) {
      return { success: true, message: "Kutish rejimidagi to'lovlar mavjud emas." }
    }

    let bearerToken = ""
    if (merchantId && merchantToken) {
      try {
        const authUrl = `https://inpay.uz/api/v1/authorization/?merchant_id=${merchantId}&merchant_token=${merchantToken}`
        const authResponse = await fetch(authUrl, { cache: "no-store" })
        const authData = await authResponse.json()
        if (authData.success && authData.bearer_token) {
          bearerToken = authData.bearer_token
        }
      } catch (e) {
        console.error("Failed to fetch Bearer token during sync:", e)
      }
    }

    let successCount = 0
    let cancelledCount = 0
    let pendingCount = 0

    for (const doc of pendingSnap.docs) {
      const p = doc.data()
      let statusFromApi = ""

      // If we have bearer token and inpayOrderId, check actual status from InPay API
      if (bearerToken && p.inpayOrderId) {
        try {
          const statusUrl = `https://inpay.uz/api/v1/status/?order_id=${p.inpayOrderId}`
          const statusRes = await fetch(statusUrl, {
            headers: { Authorization: `Bearer ${bearerToken}` },
            cache: "no-store",
          })
          const statusData = await statusRes.json()
          if (statusData && statusData.status) {
            statusFromApi = String(statusData.status).toLowerCase()
          }
        } catch (e) {
          console.error(`InPay status check error for order ${p.inpayOrderId}:`, e)
        }
      }

      const isSuccess = ["success", "paid", "completed", "1", "true", "ok"].includes(statusFromApi)
      const isCancelled = ["cancelled", "failed", "rejected", "expired", "-1", "0", "canceled"].includes(statusFromApi)

      if (isSuccess) {
        // Mark completed and credit balance
        await doc.ref.update({
          status: "success",
          receiptUrl: p.receiptUrl || (p.inpayOrderId ? `https://inpay.uz/r/${p.inpayOrderId}` : null),
          updatedAt: FieldValue.serverTimestamp(),
        })

        if (p.productId === "balance_topup" && p.userUid && p.amount) {
          const userRef = adminDb.collection("users").doc(p.userUid)
          await userRef.update({
            balance: FieldValue.increment(Number(p.amount)),
            updatedAt: FieldValue.serverTimestamp(),
          })
        }
        successCount++
      } else if (isCancelled) {
        // Mark as cancelled and DO NOT credit balance
        await doc.ref.update({
          status: "cancelled",
          receiptUrl: p.receiptUrl || (p.inpayOrderId ? `https://inpay.uz/r/${p.inpayOrderId}` : null),
          updatedAt: FieldValue.serverTimestamp(),
        })
        cancelledCount++
      } else {
        pendingCount++
      }
    }

    return {
      success: true,
      message: `Sinxronizatsiya yakunlandi! Muvaffaqiyatli: ${successCount} ta, Bekor qilingan: ${cancelledCount} ta, Kutilmoqda: ${pendingCount} ta.`,
    }
  } catch (error: any) {
    console.error("syncPendingInpayPaymentsAction error:", error)
    return { success: false, message: error.message || "Sinxronizatsiyada xatolik" }
  }
}

export async function getUserPaymentsAction(userUid: string) {
  if (!adminDb || !userUid) return { success: false, payments: [] }

  try {
    const snapshot = await adminDb
      .collection("payments")
      .where("userUid", "==", userUid)
      .get()

    if (snapshot.empty) {
      return { success: true, payments: [] }
    }

    const payments = snapshot.docs.map((doc) => {
      const data = doc.data()
      const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date()

      return {
        id: doc.id,
        inpayOrderId: data.inpayOrderId || "",
        paymentMethod: data.paymentMethod || (data.inpayOrderId ? "INPAY" : "ADMIN"),
        amount: Number(data.amount || 0),
        status: data.status || "pending",
        description: data.description || "To'lov",
        productId: data.productId || "",
        payUrl: data.payUrl || null,
        receiptUrl: data.paymentMethod === "ADMIN" ? null : (data.receiptUrl || (data.inpayOrderId ? `https://inpay.uz/r/${data.inpayOrderId}` : null)),
        createdAt: createdAtDate.toISOString(),
      }
    })

    // Sort by createdAt descending
    payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return { success: true, payments }
  } catch (error: any) {
    console.error("getUserPaymentsAction error:", error)
    return { success: false, payments: [], message: error.message }
  }
}

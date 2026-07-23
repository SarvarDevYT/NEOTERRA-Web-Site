"use server"

export async function setTelegramWebhookAction() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://site.neoterra.uz"
  const webhookUrl = `${baseUrl}/api/telegram/webhook`

  if (!token) {
    return { success: false, message: "TELEGRAM_BOT_TOKEN is missing in .env!" }
  }

  try {
    const url = `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
    const res = await fetch(url, { cache: "no-store" })
    const data = await res.json()

    if (data.ok) {
      return { success: true, message: `Webhook successfully set to ${webhookUrl}` }
    } else {
      return { success: false, message: data.description || "Failed to set webhook." }
    }
  } catch (error: any) {
    console.error("setTelegramWebhookAction error:", error)
    return { success: false, message: error.message || "Failed to set webhook." }
  }
}

export async function getTelegramWebhookInfoAction() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    return { success: false, message: "TELEGRAM_BOT_TOKEN is missing in .env!" }
  }

  try {
    const url = `https://api.telegram.org/bot${token}/getWebhookInfo`
    const res = await fetch(url, { cache: "no-store" })
    const data = await res.json()

    if (data.ok) {
      return { success: true, info: data.result }
    } else {
      return { success: false, message: data.description || "Failed to get webhook info." }
    }
  } catch (error: any) {
    console.error("getTelegramWebhookInfoAction error:", error)
    return { success: false, message: error.message || "Failed to get webhook info." }
  }
}

export async function sendTelegramAdminNotificationAction(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || "-1003795941461"

  if (!token || !chatId) {
    return { success: false, message: "Telegram bot token or admin chat ID missing!" }
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      cache: "no-store",
    })
    const data = await res.json()
    return { success: data.ok, message: data.description }
  } catch (error: any) {
    console.error("sendTelegramAdminNotification error:", error)
    return { success: false, message: error.message }
  }
}


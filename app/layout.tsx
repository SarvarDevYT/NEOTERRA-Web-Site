import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  metadataBase: new URL("https://site.neoterra.uz"),
  title: {
    default: "SITE.NEOTERRA.UZ - NeoTerra Minecraft Server in Uzbekistan",
    template: "%s | SITE.NEOTERRA.UZ"
  },
  description: "NeoTerra Minecraft Server - O'zbekistondagi eng zamonaviy va innovatsion Minecraft serveri! Ranks, crates, keys, tokenlar, qiziqarli o'yinlar. play.neoterra.uz yoki mc.neoterra.uz IP manzili orqali ulaning.",
  keywords: [
    "NeoTerra Minecraft Server",
    "NeoTerra Server",
    "NeoTerra Minecraft",
    "Minecraft server Uzbekistan",
    "O'zbekiston Minecraft serveri",
    "Minecraft UZ",
    "site.neoterra.uz",
    "shop.neoterra.uz",
    "play.neoterra.uz",
    "mc.neoterra.uz",
    "Minecraft serverlar",
    "Minecraft O'zbekiston",
    "NeoTerra"
  ],
  authors: [{ name: "NeoTerra Team, SarvarGamer_YT, SarvarDev" }],
  creator: "NeoTerra Tex.Admin SarvarGamer_YT",
  publisher: "NeoTerra",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: "https://site.neoterra.uz",
    title: "SITE.NEOTERRA.UZ - NeoTerra Minecraft Server in Uzbekistan",
    description: "NeoTerra Minecraft Server - O'zbekistondagi eng zamonaviy va innovatsion Minecraft serveri! play.neoterra.uz yoki mc.neoterra.uz manzili orqali o'yinga qo'shiling.",
    siteName: "NeoTerra",
    images: [
      {
        url: "/images/pink.jpg",
        width: 1200,
        height: 630,
        alt: "NeoTerra Minecraft Server Uzbekistan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SITE.NEOTERRA.UZ - NeoTerra Minecraft Server",
    description: "O'zbekistondagi eng innovatsion Minecraft serveri! play.neoterra.uz / mc.neoterra.uz",
    images: ["/images/pink.jpg"],
  },
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={`font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navbar />
          <main>{children}</main>
          <Analytics />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

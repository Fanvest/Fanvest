import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Fanvest - Investissement Web3 Nouvelle Génération",
  description: "Découvrez l'avenir de l'investissement avec Fanvest. Plateforme sécurisée, moderne et accessible pour tous vos investissements Web3.",
  keywords: ["investissement", "web3", "crypto", "blockchain", "finance", "DeFi"],
  authors: [{ name: "Fanvest Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#16001D",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}

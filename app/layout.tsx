import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    template: "%s | Sorte Sempre",
    default: "Sorte Sempre | O passe que dura pra sempre",
  },
  description:
    "Adquira um Passe uma única vez e participe de sorteios de forma contínua. Sem mensalidade e sem complicação.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}

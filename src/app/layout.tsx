import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/components/centered-loading.css";
import "@/styles/components/deposit-form.css";
import "@/styles/components/deposit-history.css";
import "@/styles/components/deposit-modal.css";
import "@/styles/components/copy-button.css";
import "@/styles/components/roulette-wheel.css";
import "@/styles/components/roulette-controls.css";
import "@/styles/components/roulette-bets.css";
import "@/styles/components/roulette-results.css";
import "@/styles/components/roulette-modal.css";
import "@/styles/components/roulette-selector.css";
import "@/styles/components/deposits-table.css";
import { HelpButton } from "@/components/ui/HelpButton";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/lib/providers";
import { AuthPersistence } from "@/components/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RubPlay - La mejor experiencia de ruleta online",
  description: "Disfruta de la emoción de la ruleta con gráficos increíbles, apuestas seguras y premios reales.",
  keywords: ["ruleta", "casino", "juegos", "apuestas", "online"],
  authors: [{ name: "RubPlay Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <AuthPersistence />
          <Header />
          {children}
          <HelpButton />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}

//
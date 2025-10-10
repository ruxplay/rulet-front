import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HelpButton } from "@/components/ui/HelpButton";

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
        {children}
        <HelpButton />
      </body>
    </html>
  );
}
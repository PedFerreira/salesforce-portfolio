import type { Metadata, Viewport } from "next";
import { buildCsp } from "@/lib/csp";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planning Poker · Pedro Ferreira",
  description:
    "Planning Poker gratuito e em tempo real para times ágeis. Crie uma sala, compartilhe o link e estimem juntos — sem cadastro.",
  authors: [{ name: "Pedro Ferreira", url: "https://pedroferreira.site" }],
  referrer: "strict-origin-when-cross-origin",
  openGraph: {
    title: "Planning Poker · Pedro Ferreira",
    description: "Estimativas em equipe, em tempo real e sem cadastro.",
    url: "https://pedroferreira.site/poker/",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: "#0176d3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <meta httpEquiv="Content-Security-Policy" content={buildCsp()} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

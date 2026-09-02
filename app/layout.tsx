import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GESTORA | Logiciel de gestion de caisse et de stocks",
  description: "GESTORA est la solution de gestion de stock et de caisse intuitive pour propulser votre entreprise. Suivez vos ventes, gérez votre équipe et pilotez votre activité en temps réel.",
  keywords: ["gestion de stock", "logiciel de caisse", "point de vente", "ERP", "Sénégal", "Afrique", "GESTORA", "PME", "commerce"],
  authors: [{ name: "GESTORA" }],
  openGraph: {
    title: "GESTORA | Logiciel de gestion complet",
    description: "La solution ultime pour gérer votre boutique, suivre vos ventes et développer votre entreprise sereinement.",
    url: "https://gestora.sn",
    siteName: "GESTORA",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GESTORA | Logiciel de gestion",
    description: "Prenez le contrôle de votre boutique avec GESTORA.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  }
};

import { ThemeProvider } from "./components/ThemeProvider";
import NextAuthSessionProvider from "./components/SessionProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${jakarta.variable} ${spaceGrotesk.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextAuthSessionProvider>
            {children}
          </NextAuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

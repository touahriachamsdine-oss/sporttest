import type { Metadata } from "next";
import { Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "BioTrack | Neural Health Monitoring",
  description: "Cyberpunk biological telemetry system",
  manifest: "/manifest.json",
};

import { AppProvider } from "@/context/AppContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${jetBrainsMono.variable} antialiased selection:bg-cyan-500/30`}>
        <AppProvider>
          <div className="scanline" />
          <main className="min-h-screen relative overflow-hidden">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { bricolage, onest } from "@/app/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Boshqaruv paneli — Bandlik Portal",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${bricolage.variable} ${onest.variable}`}>
      <body className="min-h-dvh bg-sand-light">{children}</body>
    </html>
  );
}

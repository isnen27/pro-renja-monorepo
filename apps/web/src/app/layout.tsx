import type { Metadata } from "next";
import "./globals.css";
import ThemeInitScript from "@/components/ui/ThemeInitScript";

export const metadata: Metadata = {
  title: "AKSI - Modul Perencanaan dan Penganggaran",
  description: "Sistem Informasi Perencanaan dan Penganggaran Pemerintah Daerah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
      </head>
      <body>{children}</body>
    </html>
  );
}



import type { Metadata } from "next";
import "./globals.css";
import ThemeInitScript from "@/components/ui/ThemeInitScript";

export const metadata: Metadata = {
  title: "AKSI - Modul Perencanaan dan Penganggaran",
  description: "AKSI - Aplikasi Keuangan Single Input",
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



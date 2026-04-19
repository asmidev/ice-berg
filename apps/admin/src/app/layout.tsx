import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Ice-Admin",
  description: "Ta'lim markazi boshqaruv tizimi",
};

import { Toaster } from "sonner";
import { ConfirmProvider } from "@/providers/confirm-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConfirmProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ConfirmProvider>
      </body>
    </html>
  );
}

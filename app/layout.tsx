import Sidebar from "@/components/Sidebar";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeadScore - Lead Qualification Portal",
  description: "Sales team portal for lead qualification and analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 md:ml-0">
            <div className="p-4 md:p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}

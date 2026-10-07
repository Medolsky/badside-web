import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "BADSIDE INTEL // FiveM Player Intelligence & SOC Monitoring",
  description: "Enterprise Tactical Monitoring & Intelligence Dashboard for FiveM Roleplay Servers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-[#0B0D10] text-[#F1F5F9] min-h-screen antialiased flex flex-col">
        {/* Main Fixed Sidebar */}
        <Sidebar />

        {/* Top Header */}
        <Header />

        {/* Content Wrapper */}
        <main className="pl-64 flex-1 flex flex-col bg-[#0B0D10] min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}

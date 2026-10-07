import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080808",
};

export const metadata: Metadata = {
  title: "BADSIDE Monitor | Ophelia Roleplay",
  description: "Pantau player, grup, dan role Discord di kota Ophelia Roleplay.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-[#080808] text-white font-sans antialiased selection:bg-[#E50914] selection:text-white flex flex-col">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-[#E50914] focus:text-white text-sm"
        >
          Lewati ke konten
        </a>
        <Header />
        <div className="flex flex-1 flex-col lg:flex-row w-full max-w-[1600px] mx-auto">
          <Sidebar />
          <main id="konten" className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

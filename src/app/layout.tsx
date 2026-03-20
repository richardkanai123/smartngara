// app/layout.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { Almarai, Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex-client-provider";
import { getToken } from "@/lib/auth-server";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/navigation/header";
import { Toaster } from "@/components/ui/sonner";

const almarai = Almarai({
  variable: "--font-almarai",
  subsets: ["latin"],
  weight: ["300", "400", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Smart Ngara",
  description: "Smart Ngara is a platform for managing your business",
};

async function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = await getToken();
  return (
    <ConvexClientProvider initialToken={token}>
      {children}
    </ConvexClientProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"  suppressHydrationWarning>
      <body className={`${almarai.variable} ${inter.variable} antialiased`}>
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            enableColorScheme
          >
        <Suspense fallback={<div className="min-h-screen" />}>
          <AuthProvider>
            <Header />
            {children}
            </AuthProvider>
        </Suspense>
        <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
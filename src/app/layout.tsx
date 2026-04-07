// app/layout.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex-client-provider";
import { getToken } from "@/lib/auth-server";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/navigation/header";
import { Toaster } from "@/components/ui/sonner";
import { Roboto, Almendra, Roboto_Mono } from "next/font/google";
import Footer from "@/components/navigation/footer";

const fontSans = Roboto({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Almendra({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
});

const fontMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Smart Ngara",
  description: "Smart Ngara is a platform for managing your business",
};

async function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = await getToken();
  return (
    <ConvexClientProvider initialToken={token}>{children}</ConvexClientProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          enableColorScheme
        >
          <Suspense fallback={<div className="min-h-screen" />}>
            <AuthProvider>
              <div className="flex min-h-dvh flex-col">
                <div className="w-full shrink-0">
                  <Header />
                </div>
                <main className="min-h-0 flex-1 pt-(--app-header-space) pb-(--app-footer-space)">
                  {children}
                </main>
                <Footer />
              </div>
            </AuthProvider>
          </Suspense>
          <Toaster  position="top-center" richColors/>
        </ThemeProvider>
      </body>
    </html>
  );
}

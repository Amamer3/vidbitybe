import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider, AuthGuard } from "@/components/providers/auth-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
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
  title: "VidBitye — Video Conferencing",
  description: "Connect with your team through high-quality video meetings",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <AuthGuard>
            <TooltipProvider>
              {children}
              <Toaster
                position="top-center"
                className="sm:!top-4 sm:!right-4 sm:!left-auto"
                toastOptions={{ className: "max-w-[calc(100vw-2rem)]" }}
              />
            </TooltipProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}

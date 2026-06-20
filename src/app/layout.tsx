import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { AuthProvider, AuthGuard } from "@/components/providers/auth-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const APP_NAME = "VidBitye";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: "VidBitye — Video Conferencing",
    template: `%s — ${APP_NAME}`,
  },
  description: "Connect with your team through high-quality video meetings",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1d4ed8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col bg-background text-foreground">
        <AuthProvider>
          <AuthGuard>
            <TooltipProvider>
              {children}
              <Toaster
                richColors
                closeButton
                position="top-center"
                expand
                visibleToasts={4}
                toastOptions={{
                  duration: 4000,
                  classNames: {
                    toast: "border border-border bg-card text-foreground shadow-lg",
                    title: "font-medium",
                    description: "text-muted-foreground",
                  },
                }}
                className="sm:!top-4 sm:!right-4 sm:!left-auto"
              />
              <InstallPrompt />
            </TooltipProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}

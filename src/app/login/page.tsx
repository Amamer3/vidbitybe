import Link from "next/link";
import { Video } from "lucide-react";
import { LoginForm } from "@/features/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.12),transparent)]"
      />

      <header className="relative border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Video className="h-5 w-5" />
            </span>
            VidBitye
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium text-primary hover:underline"
          >
            Create account
          </Link>
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <Card className="w-full max-w-md border-border/80 shadow-lg shadow-primary/5">
          <CardContent className="p-5 sm:p-8">
            <LoginForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

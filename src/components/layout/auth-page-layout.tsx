import Link from "next/link";
import { Video } from "lucide-react";

interface AuthPageLayoutProps {
  children: React.ReactNode;
  headerAction?: {
    href: string;
    label: string;
  };
}

export function AuthPageLayout({ children, headerAction }: AuthPageLayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.12),transparent)]"
      />

      <header className="relative shrink-0 border-b border-border/60 bg-background/80 pt-safe backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 font-semibold tracking-tight sm:gap-2.5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:h-9 sm:w-9">
              <Video className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <span className="truncate text-sm sm:text-base">VidBitye</span>
          </Link>
          {headerAction && (
            <Link
              href={headerAction.href}
              className="shrink-0 text-sm font-medium text-primary hover:underline"
            >
              {headerAction.label}
            </Link>
          )}
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 py-6 pb-safe sm:py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

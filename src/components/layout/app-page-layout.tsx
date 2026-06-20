import { AppHeader } from "@/components/layout/app-header";
import { ProtectedRoute } from "@/components/providers/auth-provider";

interface AppPageLayoutProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  actionsClassName?: string;
  children: React.ReactNode;
}

export function AppPageLayout({
  title,
  description,
  actions,
  actionsClassName,
  children,
}: AppPageLayoutProps) {
  return (
    <ProtectedRoute>
      <AppHeader />
      <main className="app-shell mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-safe sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p>
            )}
          </div>
          {actions && (
            <div
              className={
                actionsClassName ??
                "flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
              }
            >
              {actions}
            </div>
          )}
        </div>
        {children}
      </main>
    </ProtectedRoute>
  );
}

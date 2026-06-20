import { LoginForm } from "@/features/auth/login-form";
import { AuthPageLayout } from "@/components/layout/auth-page-layout";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <AuthPageLayout headerAction={{ href: "/register", label: "Create account" }}>
      <Card className="w-full border-border/80 shadow-lg shadow-primary/5">
        <CardContent className="p-4 sm:p-8">
          <LoginForm />
        </CardContent>
      </Card>
    </AuthPageLayout>
  );
}

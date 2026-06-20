import { ResetPasswordForm } from "@/features/auth/reset-password-form";
import { AuthPageLayout } from "@/components/layout/auth-page-layout";

export default function ResetPasswordPage() {
  return (
    <AuthPageLayout headerAction={{ href: "/login", label: "Sign in" }}>
      <ResetPasswordForm />
    </AuthPageLayout>
  );
}

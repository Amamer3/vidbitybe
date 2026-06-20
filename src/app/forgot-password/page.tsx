import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";
import { AuthPageLayout } from "@/components/layout/auth-page-layout";

export default function ForgotPasswordPage() {
  return (
    <AuthPageLayout headerAction={{ href: "/login", label: "Sign in" }}>
      <ForgotPasswordForm />
    </AuthPageLayout>
  );
}

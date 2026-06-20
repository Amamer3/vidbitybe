import { RegisterForm } from "@/features/auth/register-form";
import { AuthPageLayout } from "@/components/layout/auth-page-layout";

export default function RegisterPage() {
  return (
    <AuthPageLayout headerAction={{ href: "/login", label: "Sign in" }}>
      <RegisterForm />
    </AuthPageLayout>
  );
}

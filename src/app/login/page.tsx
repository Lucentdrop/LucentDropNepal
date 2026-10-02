import { AuthForm } from "@/components/forms/auth-form";
export const metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};
export default function LoginPage() {
  return <AuthForm />;
}

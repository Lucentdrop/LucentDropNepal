import { AuthForm } from "@/components/forms/auth-form";
export const metadata = {
  title: "Create an Account",
  robots: { index: false, follow: false },
};
export default function SignupPage() {
  return <AuthForm signup />;
}

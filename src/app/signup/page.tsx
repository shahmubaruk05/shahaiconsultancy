import { SignupForm } from "@/components/auth/signup-form";
import { Logo } from "@/components/logo";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
            <Logo />
            <h1 className="text-3xl font-bold mt-4">Create your account</h1>
            <p className="text-muted-foreground">Get started with our AI-powered business tools</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}

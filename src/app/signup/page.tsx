import { SignupForm } from "@/components/auth/signup-form";
import { Logo } from "@/components/logo";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
            <Logo className="w-16 h-16 mb-4 text-primary" />
            <h1 className="text-3xl font-bold">Create your Shah Mubaruk account</h1>
            <p className="text-muted-foreground">Get started with our AI-powered business tools</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}

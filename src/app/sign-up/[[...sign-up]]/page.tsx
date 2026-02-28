import { SignUp } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
            <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/onboarding" />
        </div>
    );
}

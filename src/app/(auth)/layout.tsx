import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthHeader } from "@/components/auth-header";

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background">
            <AuthHeader user={session.user} />
            <main>{children}</main>
        </div>
    );
}

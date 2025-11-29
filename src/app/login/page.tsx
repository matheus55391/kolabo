import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { loginAction } from "./actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    // Redirecionar se já estiver logado
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        redirect("/dashboard");
    }

    const initialValues = {
        email: "",
        password: "",
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-xl">K</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Bem-vindo ao Kolabo</CardTitle>
                    <CardDescription>
                        Entre com sua conta para continuar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm values={initialValues} action={loginAction} />

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Não tem uma conta? </span>
                        <Link href="/register" className="text-primary hover:underline font-medium">
                            Cadastre-se
                        </Link>
                    </div>

                    <div className="mt-4 text-center">
                        <Link href="/" className="text-sm text-muted-foreground hover:underline">
                            Voltar para página inicial
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

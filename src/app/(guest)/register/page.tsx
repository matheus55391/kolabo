import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-background to-secondary/20 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-xl">K</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Criar conta no Kolabo</CardTitle>
                    <CardDescription>
                        Preencha os dados abaixo para começar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RegisterForm />

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Já tem uma conta? </span>
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Faça login
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

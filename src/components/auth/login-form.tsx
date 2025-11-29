"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Form from "next/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginInput } from "@/schemas/auth-schema";
import { toast } from "sonner";

const resolver = zodResolver(loginSchema);

type ActionState = {
    errors: Record<string, { message: string }>;
    values: LoginInput;
    success?: boolean;
};

type LoginFormProps = {
    values: LoginInput;
    action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

export function LoginForm({ values, action }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(action, {
        values,
        errors: {},
    });

    const { formState, register } = useForm<LoginInput>({
        resolver,
        errors: state.errors,
        mode: "onBlur",
        values: state.values,
    });

    useEffect(() => {
        if (state.success) {
            toast.success("Bem-vindo de volta!", {
                description: "Login realizado com sucesso",
                duration: 3000,
            });
            router.push("/dashboard");
        } else if (state.errors.root) {
            // Mensagens de erro mais específicas e amigáveis
            let errorMessage = "Erro ao fazer login";
            let errorDescription = "Tente novamente mais tarde";

            const errorMsg = state.errors.root.message.toLowerCase();

            if (errorMsg.includes("user not found") || errorMsg.includes("not found") || errorMsg.includes("não encontrado")) {
                errorMessage = "Usuário não encontrado";
                errorDescription = "Verifique seu e-mail ou cadastre-se";
            } else if (errorMsg.includes("password") || errorMsg.includes("senha") || errorMsg.includes("incorret")) {
                errorMessage = "E-mail ou senha incorretos";
                errorDescription = "Verifique suas credenciais";
            }

            toast.error(errorMessage, {
                description: errorDescription,
                duration: 5000,
            });
        }
    }, [state.success, state.errors.root, router]);

    return (
        <div className="space-y-4">
            <Form action={formAction} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                        {...register("email")}
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        disabled={isPending}
                    />
                    {formState.errors.email && (
                        <p className="text-sm text-destructive" role="alert">
                            {formState.errors.email.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                        <Input
                            {...register("password")}
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            disabled={isPending}
                            className="pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isPending}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="sr-only">
                                {showPassword ? "Ocultar senha" : "Mostrar senha"}
                            </span>
                        </Button>
                    </div>
                    {formState.errors.password && (
                        <p className="text-sm text-destructive" role="alert">
                            {formState.errors.password.message}
                        </p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Entrando...
                        </>
                    ) : (
                        "Entrar"
                    )}
                </Button>
            </Form>
        </div>
    );
}

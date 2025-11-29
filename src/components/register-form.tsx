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
import { registerSchema, type RegisterInput } from "@/schemas/auth-schema";
import { toast } from "sonner";

const resolver = zodResolver(registerSchema);

type ActionState = {
    errors: Record<string, { message: string }>;
    values: RegisterInput;
    success?: boolean;
};

type RegisterFormProps = {
    values: RegisterInput;
    action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

export function RegisterForm({ values, action }: RegisterFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(action, {
        values,
        errors: {},
    });

    const { formState, register } = useForm<RegisterInput>({
        resolver,
        errors: state.errors,
        mode: "onSubmit",
        values: state.values,
    });

    useEffect(() => {
        if (state.success) {
            toast.success("Bem-vindo ao Kolabo! 🎉", {
                description: "Sua conta foi criada com sucesso",
                duration: 3000,
            });
            router.push("/dashboard");
        } else if (state.errors.root) {
            // Mensagens de erro mais específicas e amigáveis
            let errorMessage = "Erro ao criar conta";
            let errorDescription = "Tente novamente mais tarde";

            const errorMsg = state.errors.root.message.toLowerCase();

            if (errorMsg.includes("already exists") || errorMsg.includes("duplicate") || errorMsg.includes("unique") || errorMsg.includes("já")) {
                errorMessage = "E-mail já cadastrado";
                errorDescription = "Este e-mail já está sendo usado. Faça login ou use outro e-mail";
            } else if (errorMsg.includes("invalid email")) {
                errorMessage = "E-mail inválido";
                errorDescription = "Verifique o formato do seu e-mail";
            } else if (errorMsg.includes("password") || errorMsg.includes("senha")) {
                errorMessage = "Senha inválida";
                errorDescription = "A senha deve ter pelo menos 8 caracteres";
            } else if (errorMsg.includes("failed to create")) {
                errorMessage = "Erro ao criar usuário";
                errorDescription = "Verifique os dados e tente novamente";
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
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                        {...register("name")}
                        id="name"
                        type="text"
                        placeholder="Seu nome"
                        disabled={isPending}
                    />
                    {formState.errors.name && (
                        <p className="text-sm text-destructive" role="alert">
                            {formState.errors.name.message}
                        </p>
                    )}
                </div>

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
                    <p className="text-xs text-muted-foreground">
                        Mínimo de 8 caracteres
                    </p>
                    {formState.errors.password && (
                        <p className="text-sm text-destructive" role="alert">
                            {formState.errors.password.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <div className="relative">
                        <Input
                            {...register("confirmPassword")}
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            disabled={isPending}
                            className="pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isPending}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="sr-only">
                                {showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                            </span>
                        </Button>
                    </div>
                    {formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive" role="alert">
                            {formState.errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando conta...
                        </>
                    ) : (
                        "Criar conta"
                    )}
                </Button>
            </Form>
        </div>
    );
}

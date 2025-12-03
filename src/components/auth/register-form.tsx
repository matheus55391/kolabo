"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/schemas/auth-schema";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const resolver = zodResolver(registerSchema);

export function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
        resolver,
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: RegisterInput) => {
        await authClient.signUp.email(
            {
                email: data.email,
                password: data.password,
                name: data.name,
                callbackURL: "/dashboard",
            },
            {
                onRequest: () => {
                    setIsLoading(true);
                },
                onSuccess: () => {
                    toast.success("Bem-vindo ao Kolabo! 🎉", {
                        description: "Sua conta foi criada com sucesso",
                        duration: 3000,
                    });
                    router.push("/dashboard");
                },
                onError: (ctx) => {
                    setIsLoading(false);
                    const errorMsg = ctx.error.message?.toLowerCase() || "";

                    let errorMessage = "Erro ao criar conta";
                    let errorDescription = "Tente novamente mais tarde";

                    if (errorMsg.includes("already exists") || errorMsg.includes("duplicate") || errorMsg.includes("unique")) {
                        errorMessage = "E-mail já cadastrado";
                        errorDescription = "Este e-mail já está sendo usado. Faça login ou use outro e-mail";
                    } else if (errorMsg.includes("invalid email")) {
                        errorMessage = "E-mail inválido";
                        errorDescription = "Verifique o formato do seu e-mail";
                    } else if (errorMsg.includes("password")) {
                        errorMessage = "Senha inválida";
                        errorDescription = "A senha deve ter pelo menos 8 caracteres";
                    }

                    toast.error(errorMessage, {
                        description: errorDescription,
                        duration: 5000,
                    });
                },
            }
        );
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                        {...register("name")}
                        id="name"
                        type="text"
                        placeholder="Seu nome"
                        disabled={isLoading}
                    />
                    {errors.name && (
                        <p className="text-sm text-destructive" role="alert">
                            {errors.name.message}
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
                        disabled={isLoading}
                    />
                    {errors.email && (
                        <p className="text-sm text-destructive" role="alert">
                            {errors.email.message}
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
                            disabled={isLoading}
                            className="pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
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
                    {errors.password && (
                        <p className="text-sm text-destructive" role="alert">
                            {errors.password.message}
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
                            disabled={isLoading}
                            className="pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
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
                    {errors.confirmPassword && (
                        <p className="text-sm text-destructive" role="alert">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando conta...
                        </>
                    ) : (
                        "Criar conta"
                    )}
                </Button>
            </form>
        </div>
    );
}

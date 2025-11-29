"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginInput } from "@/schemas/auth-schema";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const resolver = zodResolver(loginSchema);

export function LoginForm({ values }: { values: LoginInput }) {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const { formState, register, handleSubmit } = useForm<LoginInput>({
        resolver,
        defaultValues: values,
        mode: "onBlur",
    });

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true);

        await authClient.signIn.email({
            email: data.email,
            password: data.password,
            callbackURL: "/dashboard",
        }, {
            onRequest: () => {
                setIsLoading(true);
            },
            onSuccess: () => {
                toast.success("Login realizado com sucesso!");
                router.push("/dashboard");
            },
            onError: (ctx) => {
                setIsLoading(false);
                toast.error(ctx.error.message || "Erro ao fazer login");
            },
        });
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                        {...register("email")}
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        disabled={isLoading}
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
                    {formState.errors.password && (
                        <p className="text-sm text-destructive" role="alert">
                            {formState.errors.password.message}
                        </p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Entrando...
                        </>
                    ) : (
                        "Entrar"
                    )}
                </Button>
            </form>
        </div>
    );
}

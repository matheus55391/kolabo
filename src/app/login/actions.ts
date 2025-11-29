"use server";

import { loginSchema, type LoginInput } from "@/schemas/auth-schema";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";

type ActionState = {
    errors: Record<string, { message: string }>;
    values: LoginInput;
    success?: boolean;
};

export async function loginAction(
    initialState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const values = {
        email: String(formData.get("email") || ""),
        password: String(formData.get("password") || ""),
        // Workaround to prevent form state from disappearing after multiple submissions
        __timestamp: String(Date.now()),
    };

    // Validação com Zod
    const { error: parseError } = loginSchema.safeParse(values);
    const errors: ActionState["errors"] = {};

    if (parseError) {
        for (const { path, message } of parseError.issues) {
            errors[path.join(".")] = { message };
        }
        return { values, errors };
    }

    const { email, password } = values;

    try {
        // Autenticação usando Better Auth
        const result = await auth.api.signInEmail({
            body: { email, password },
            headers: await headers(),
        });

        if (!result) {
            errors.root = { message: "E-mail ou senha incorretos" };
            return { values, errors, success: false };
        }

        // Definir cookies de sessão manualmente
        const cookieStore = await cookies();
        if (result.token) {
            cookieStore.set('better-auth.session_token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            });
        }

        // Redirecionar após sucesso
        redirect("/dashboard");
    } catch (error) {
        console.error("Login error:", error);

        // Se for um redirect, propagar
        if (error && typeof error === "object" && "digest" in error) {
            throw error;
        }

        errors.root = { message: "Erro ao fazer login. Tente novamente." };
        return { values, errors, success: false };
    }
}

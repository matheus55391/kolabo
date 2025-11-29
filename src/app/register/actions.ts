"use server";

import { registerSchema, type RegisterInput } from "@/schemas/auth-schema";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";

type ActionState = {
    errors: Record<string, { message: string }>;
    values: RegisterInput;
    success?: boolean;
};

export async function registerAction(
    initialState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const values = {
        name: String(formData.get("name") || ""),
        email: String(formData.get("email") || ""),
        password: String(formData.get("password") || ""),
        confirmPassword: String(formData.get("confirmPassword") || ""),
        // Workaround to prevent form state from disappearing after multiple submissions
        __timestamp: String(Date.now()),
    };

    // Validação com Zod
    const { error: parseError } = registerSchema.safeParse(values);
    const errors: ActionState["errors"] = {};

    if (parseError) {
        for (const { path, message } of parseError.issues) {
            errors[path.join(".")] = { message };
        }
        return { values, errors };
    }

    const { name, email, password } = values;

    try {
        // Registro usando Better Auth
        const result = await auth.api.signUpEmail({
            body: { name, email, password },
            headers: await headers(),
        });

        if (!result) {
            errors.root = { message: "Erro ao criar conta. E-mail já pode estar em uso." };
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
        console.error("Register error:", error);

        // Se for um redirect, propagar
        if (error && typeof error === "object" && "digest" in error) {
            throw error;
        }

        errors.root = { message: "Erro ao criar conta. Tente novamente." };
        return { values, errors, success: false };
    }
}

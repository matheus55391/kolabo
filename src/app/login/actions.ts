"use server";

import { loginSchema, type LoginInput } from "@/schemas/auth-schema";
import { auth } from "@/lib/auth";
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
        // O Better Auth vai configurar os cookies automaticamente via middleware
        const result = await auth.api.signInEmail({
            body: { email, password },
            headers: await headers(),
        });

        if (!result) {
            errors.root = { message: "E-mail ou senha incorretos" };
            return { values, errors, success: false };
        }

        console.log("Login bem-sucedido, sessão criada:", result.user?.email);

        // Retornar sucesso para o client fazer redirect
        return { values, errors: {}, success: true };
    } catch (error) {
        console.error("Login error:", error);

        // Mensagens de erro específicas
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        const errorStatus = error && typeof error === "object" && "status" in error ? String(error.status) : "";

        if (errorMessage.toLowerCase().includes("user not found") || errorStatus === "UNAUTHORIZED") {
            errors.root = { message: "Usuário não encontrado" };
        } else if (errorMessage.toLowerCase().includes("invalid password") || errorMessage.toLowerCase().includes("invalid email or password")) {
            errors.root = { message: "E-mail ou senha incorretos" };
        } else {
            errors.root = { message: "E-mail ou senha incorretos" };
        }

        return { values, errors, success: false };
    }
}

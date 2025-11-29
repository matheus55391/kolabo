"use server";

import { registerSchema, type RegisterInput } from "@/schemas/auth-schema";
import { auth } from "@/lib/auth";
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
        // Criar usuário usando Better Auth
        // O Better Auth vai configurar os cookies automaticamente via middleware
        const result = await auth.api.signUpEmail({
            body: { name, email, password },
            headers: await headers(),
        });

        if (!result) {
            errors.root = { message: "Erro ao criar conta" };
            return { values, errors, success: false };
        }

        console.log("Registro bem-sucedido, sessão criada:", result.user?.email);

        // Retornar sucesso para o client fazer redirect
        return { values, errors: {}, success: true };
    } catch (error) {
        console.error("Register error:", error);

        // Mensagens de erro específicas
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

        if (errorMessage.toLowerCase().includes("already exists") ||
            errorMessage.toLowerCase().includes("duplicate") ||
            errorMessage.toLowerCase().includes("unique")) {
            errors.root = { message: "E-mail já cadastrado" };
        } else if (errorMessage.toLowerCase().includes("invalid email")) {
            errors.root = { message: "E-mail inválido" };
        } else if (errorMessage.toLowerCase().includes("password")) {
            errors.root = { message: "Senha deve ter pelo menos 8 caracteres" };
        } else {
            errors.root = { message: "Erro ao criar conta. Tente novamente." };
        }

        return { values, errors, success: false };
    }
}

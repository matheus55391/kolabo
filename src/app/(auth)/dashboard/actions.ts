"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createProjectSchema } from "@/schemas/project-schema";
import type { ActionResponse } from "@/@types/actions";
import { createProject } from "@/repositories/project.repository";

export async function createProjectAction(formData: FormData): Promise<ActionResponse> {
    try {
        // Verificar sessão
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { success: false, error: "Não autenticado" };
        }

        // Validar dados
        const name = String(formData.get("name") || "");
        const description = String(formData.get("description") || "") || null;
        const result = createProjectSchema.safeParse({ name });

        if (!result.success) {
            return { success: false, error: result.error.issues[0].message };
        }

        // Criar projeto
        const project = await createProject({
            name: result.data.name,
            description,
            ownerId: session.user.id,
        });

        console.log("Projeto criado com sucesso:", project.id);

        // Revalidar a página do dashboard
        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error("Erro ao criar projeto:", error);
        return { success: false, error: "Erro ao criar projeto. Tente novamente." };
    }
}

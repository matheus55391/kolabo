"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createProjectSchema } from "@/schemas/project-schema";
import type { ActionResponse } from "@/@types/actions";

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
        const result = createProjectSchema.safeParse({ name });

        if (!result.success) {
            return { success: false, error: result.error.issues[0].message };
        }

        // Criar projeto com colunas padrão do Kanban
        const project = await prisma.project.create({
            data: {
                name: result.data.name,
                ownerId: session.user.id,
                members: {
                    create: {
                        userId: session.user.id,
                        role: "owner",
                    },
                },
                columns: {
                    createMany: {
                        data: [
                            { name: "Pendente", order: 0 },
                            { name: "Andamento", order: 1 },
                            { name: "Concluído", order: 2 },
                        ],
                    },
                },
            },
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

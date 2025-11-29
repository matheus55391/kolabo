"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createTaskSchema, updateTaskSchema } from "@/schemas/project-schema";
import { z } from "zod";
import type { ActionResponse } from "@/@types/actions";

export async function createTaskAction(
    projectId: string,
    data: z.infer<typeof createTaskSchema>
): Promise<ActionResponse<{
    id: string;
    title: string;
    description: string | null;
    priority: string;
    labels: string[];
    order: number;
    createdAt: Date;
    updatedAt: Date;
    creator: { id: string; name: string; email: string; image: string | null };
    assignee: { id: string; name: string; email: string; image: string | null } | null;
    column: { id: string; name: string; order: number };
}>> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { success: false, error: "Não autenticado" };
        }

        // Verificar se o usuário é membro do projeto
        const membership = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId: session.user.id,
                },
            },
        });

        if (!membership) {
            return { success: false, error: "Você não tem permissão para criar tarefas neste projeto" };
        }

        // Validar dados
        const result = createTaskSchema.safeParse(data);
        if (!result.success) {
            return { success: false, error: result.error.issues[0].message };
        }

        // Verificar se a coluna pertence ao projeto
        const column = await prisma.column.findFirst({
            where: {
                id: result.data.columnId,
                projectId,
            },
        });

        if (!column) {
            return { success: false, error: "Coluna não encontrada" };
        }

        // Obter próxima ordem na coluna
        const lastTask = await prisma.task.findFirst({
            where: { columnId: result.data.columnId },
            orderBy: { order: "desc" },
        });

        const order = lastTask ? lastTask.order + 1 : 0;

        // Criar tarefa
        const task = await prisma.task.create({
            data: {
                title: result.data.title,
                description: result.data.description,
                priority: result.data.priority,
                labels: result.data.labels,
                order,
                projectId,
                columnId: result.data.columnId,
                creatorId: session.user.id,
                assigneeId: result.data.assigneeId,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                column: true,
            },
        });

        // Registrar atividade
        await prisma.activityLog.create({
            data: {
                action: "created",
                description: `${session.user.name} criou a tarefa "${task.title}"`,
                taskId: task.id,
                userId: session.user.id,
            },
        });

        revalidatePath(`/project/${projectId}`);

        return { success: true, data: task };
    } catch (error) {
        console.error("Erro ao criar tarefa:", error);
        return { success: false, error: "Erro ao criar tarefa" };
    }
}

export async function updateTaskAction(
    taskId: string,
    data: z.infer<typeof updateTaskSchema>
): Promise<ActionResponse<{
    id: string;
    title: string;
    description: string | null;
    priority: string;
    labels: string[];
    creator: { id: string; name: string; email: string; image: string | null };
    assignee: { id: string; name: string; email: string; image: string | null } | null;
    column: { id: string; name: string; order: number };
}>> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { success: false, error: "Não autenticado" };
        }

        // Buscar tarefa atual
        const currentTask = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: true,
                column: true,
            },
        });

        if (!currentTask) {
            return { success: false, error: "Tarefa não encontrada" };
        }

        // Verificar se o usuário é membro do projeto
        const membership = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId: currentTask.projectId,
                    userId: session.user.id,
                },
            },
        });

        if (!membership) {
            return { success: false, error: "Você não tem permissão para editar esta tarefa" };
        }

        // Validar dados
        const result = updateTaskSchema.safeParse(data);
        if (!result.success) {
            return { success: false, error: result.error.issues[0].message };
        }

        const updateData: typeof result.data & { order?: number } = result.data;

        // Se mudou de coluna, atualizar ordem
        if (updateData.columnId && updateData.columnId !== currentTask.columnId) {
            const lastTask = await prisma.task.findFirst({
                where: { columnId: updateData.columnId },
                orderBy: { order: "desc" },
            });
            updateData.order = lastTask ? lastTask.order + 1 : 0;
        }

        // Atualizar tarefa
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: updateData,
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                column: true,
            },
        });

        // Registrar atividades para cada campo alterado
        const activities = [];

        if (updateData.title && updateData.title !== currentTask.title) {
            activities.push({
                action: "updated",
                field: "title",
                oldValue: currentTask.title,
                newValue: updateData.title,
                description: `${session.user.name} alterou o título`,
                taskId,
                userId: session.user.id,
            });
        }

        if (updateData.columnId && updateData.columnId !== currentTask.columnId) {
            const newColumn = await prisma.column.findUnique({ where: { id: updateData.columnId } });
            activities.push({
                action: "moved",
                field: "status",
                oldValue: currentTask.column.name,
                newValue: newColumn?.name || "",
                description: `${session.user.name} moveu de "${currentTask.column.name}" para "${newColumn?.name}"`,
                taskId,
                userId: session.user.id,
            });
        }

        if (updateData.priority && updateData.priority !== currentTask.priority) {
            activities.push({
                action: "updated",
                field: "priority",
                oldValue: currentTask.priority,
                newValue: updateData.priority,
                description: `${session.user.name} alterou a prioridade`,
                taskId,
                userId: session.user.id,
            });
        }

        if (updateData.assigneeId !== undefined && updateData.assigneeId !== currentTask.assigneeId) {
            const assignee = updateData.assigneeId
                ? await prisma.user.findUnique({ where: { id: updateData.assigneeId } })
                : null;
            activities.push({
                action: "assigned",
                field: "assignee",
                oldValue: currentTask.assigneeId || "",
                newValue: updateData.assigneeId || "",
                description: assignee
                    ? `${session.user.name} atribuiu para ${assignee.name}`
                    : `${session.user.name} removeu o responsável`,
                taskId,
                userId: session.user.id,
            });
        }

        if (updateData.description !== undefined && updateData.description !== currentTask.description) {
            activities.push({
                action: "updated",
                field: "description",
                oldValue: currentTask.description || "",
                newValue: updateData.description || "",
                description: `${session.user.name} ${updateData.description ? 'atualizou' : 'removeu'} a descrição`,
                taskId,
                userId: session.user.id,
            });
        }

        if (updateData.labels && JSON.stringify(updateData.labels.sort()) !== JSON.stringify(currentTask.labels.sort())) {
            activities.push({
                action: "updated",
                field: "labels",
                oldValue: currentTask.labels.join(", "),
                newValue: updateData.labels.join(", "),
                description: `${session.user.name} atualizou as labels`,
                taskId,
                userId: session.user.id,
            });
        }

        if (activities.length > 0) {
            await prisma.activityLog.createMany({
                data: activities,
            });
        }

        revalidatePath(`/project/${currentTask.projectId}`);

        return { success: true, data: updatedTask };
    } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
        return { success: false, error: "Erro ao atualizar tarefa" };
    }
}

export async function deleteTaskAction(taskId: string): Promise<ActionResponse<void>> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { success: false, error: "Não autenticado" };
        }

        // Buscar tarefa
        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task) {
            return { success: false, error: "Tarefa não encontrada" };
        }

        // Verificar permissão
        const membership = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId: task.projectId,
                    userId: session.user.id,
                },
            },
        });

        if (!membership || (membership.role === "member" && task.creatorId !== session.user.id)) {
            return { success: false, error: "Você não tem permissão para excluir esta tarefa" };
        }

        // Deletar tarefa (cascade deletará comments e activities)
        await prisma.task.delete({
            where: { id: taskId },
        });

        revalidatePath(`/project/${task.projectId}`);

        return { success: true };
    } catch (error) {
        console.error("Erro ao deletar tarefa:", error);
        return { success: false, error: "Erro ao deletar tarefa" };
    }
}

export async function addCommentAction(
    taskId: string,
    content: string
): Promise<ActionResponse<{
    id: string;
    content: string;
    createdAt: Date;
    author: { id: string; name: string; email: string; image: string | null };
}>> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { success: false, error: "Não autenticado" };
        }

        if (!content || content.trim().length === 0) {
            return { success: false, error: "Comentário não pode estar vazio" };
        }

        // Buscar tarefa e verificar permissão
        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task) {
            return { success: false, error: "Tarefa não encontrada" };
        }

        const membership = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId: task.projectId,
                    userId: session.user.id,
                },
            },
        });

        if (!membership) {
            return { success: false, error: "Você não tem permissão para comentar nesta tarefa" };
        }

        // Criar comentário
        const comment = await prisma.comment.create({
            data: {
                content,
                taskId,
                authorId: session.user.id,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        });

        // Registrar atividade
        await prisma.activityLog.create({
            data: {
                action: "commented",
                description: `${session.user.name} adicionou um comentário`,
                taskId,
                userId: session.user.id,
            },
        });

        revalidatePath(`/project/${task.projectId}`);

        return { success: true, data: comment };
    } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
        return { success: false, error: "Erro ao adicionar comentário" };
    }
}

export async function addLabelToProjectAction(
    projectId: string,
    label: string
): Promise<ActionResponse<string[]>> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { success: false, error: "Não autenticado" };
        }

        // Verificar permissão
        const membership = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId: session.user.id,
                },
            },
        });

        if (!membership || membership.role === "member") {
            return { success: false, error: "Apenas admins e owners podem adicionar labels" };
        }

        // Buscar projeto
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return { success: false, error: "Projeto não encontrado" };
        }

        // Adicionar label se ainda não existe
        if (project.labels.includes(label)) {
            return { success: false, error: "Label já existe" };
        }

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                labels: [...project.labels, label],
            },
        });

        revalidatePath(`/project/${projectId}`);

        return { success: true, data: updatedProject.labels };
    } catch (error) {
        console.error("Erro ao adicionar label:", error);
        return { success: false, error: "Erro ao adicionar label" };
    }
}

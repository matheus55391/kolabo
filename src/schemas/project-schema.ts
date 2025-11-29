import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(50, "Nome deve ter no máximo 50 caracteres"),
});

export const createTaskSchema = z.object({
    title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    labels: z.array(z.string()).default([]),
    columnId: z.string().min(1, "Coluna é obrigatória"),
    assigneeId: z.string().optional(),
});

export const updateTaskSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    labels: z.array(z.string()).optional(),
    columnId: z.string().optional(),
    assigneeId: z.string().nullable().optional(),
});

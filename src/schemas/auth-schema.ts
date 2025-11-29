import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .email("E-mail inválido"),
    password: z
        .string()
        .min(1, "Senha é obrigatória")
        .min(8, "A senha deve ter pelo menos 8 caracteres"),
});

export const registerSchema = z.object({
    name: z
        .string()
        .min(1, "Nome é obrigatório")
        .min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z
        .string()
        .min(1, "E-mail é obrigatório")
        .email("E-mail inválido"),
    password: z
        .string()
        .min(1, "Senha é obrigatória")
        .min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z
        .string()
        .min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

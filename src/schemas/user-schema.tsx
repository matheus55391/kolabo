import { z } from "zod";

export const userSchema = z.object({
    email: z.email("E-mail inválido"),
    name: z.string().min(2, "Nome muito curto").optional(),
});

"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createColumnSchema } from "@/schemas/project-schema";
import { createColumnAction } from "@/app/(auth)/project/[id]/actions";
import { useColumns } from "@/contexts/columns-context";

interface CreateColumnDialogProps {
    projectId: string;
    children: React.ReactNode;
}

export function CreateColumnDialog({ projectId, children }: CreateColumnDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { addColumn } = useColumns();

    const form = useForm<z.infer<typeof createColumnSchema>>({
        resolver: zodResolver(createColumnSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = (data: z.infer<typeof createColumnSchema>) => {
        startTransition(async () => {
            const result = await createColumnAction(projectId, data);

            if (result.success && result.data) {
                // Atualizar UI imediatamente
                addColumn({
                    id: result.data.id,
                    name: result.data.name,
                    order: result.data.order,
                    tasks: [],
                });
                form.reset();
                setOpen(false);
                toast.success("Coluna criada com sucesso!");
                // Revalidar em background
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao criar coluna");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nova Coluna</DialogTitle>
                    <DialogDescription>Adicione uma nova coluna ao seu quadro Kanban.</DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da coluna</Label>
                        <Input
                            id="name"
                            placeholder="Ex: Em revisão"
                            {...form.register("name")}
                            disabled={isPending}
                        />
                        {form.formState.errors.name && (
                            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Criando..." : "Criar coluna"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

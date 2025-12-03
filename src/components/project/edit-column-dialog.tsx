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
import { updateColumnSchema } from "@/schemas/project-schema";
import { updateColumnAction, deleteColumnAction } from "@/app/(auth)/project/[id]/actions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useColumns } from "@/contexts/columns-context";

interface EditColumnDialogProps {
    columnId: string;
    columnName: string;
    hasBlocks?: boolean;
    children: React.ReactNode;
}

export function EditColumnDialog({ columnId, columnName, hasBlocks = false, children }: EditColumnDialogProps) {
    const [open, setOpen] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { updateColumn, removeColumn } = useColumns();

    const form = useForm<z.infer<typeof updateColumnSchema>>({
        resolver: zodResolver(updateColumnSchema),
        defaultValues: {
            name: columnName,
        },
    });

    const onSubmit = (data: z.infer<typeof updateColumnSchema>) => {
        startTransition(async () => {
            const result = await updateColumnAction(columnId, data);

            if (result.success) {
                // Atualizar UI imediatamente
                updateColumn(columnId, data.name);
                setOpen(false);
                toast.success("Coluna atualizada!");
                // Revalidar em background
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao atualizar coluna");
            }
        });
    };

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteColumnAction(columnId);

            if (result.success) {
                // Atualizar UI imediatamente
                removeColumn(columnId);
                setShowDeleteAlert(false);
                setOpen(false);
                toast.success("Coluna excluída!");
                // Revalidar em background
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao excluir coluna");
            }
        });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Coluna</DialogTitle>
                        <DialogDescription>Altere o nome da coluna ou exclua-a.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da coluna</Label>
                            <Input
                                id="name"
                                placeholder="Nome da coluna"
                                {...form.register("name")}
                                disabled={isPending}
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                            )}
                        </div>
                        <DialogFooter className="flex justify-between">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setShowDeleteAlert(true)}
                                disabled={isPending || hasBlocks}
                            >
                                Excluir
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={isPending}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? "Salvando..." : "Salvar"}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A coluna &quot;{columnName}&quot; será excluída permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isPending ? "Excluindo..." : "Excluir"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

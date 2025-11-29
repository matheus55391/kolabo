"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { createProjectAction } from "@/app/(auth)/dashboard/actions";
import { toast } from "sonner";

type CreateProjectDialogProps = {
    children?: React.ReactNode;
    asChild?: boolean;
};

export function CreateProjectDialog({ children, asChild }: CreateProjectDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await createProjectAction(formData);

            if (result.success) {
                toast.success("Projeto criado!", {
                    description: "Seu projeto foi criado com sucesso",
                });
                setOpen(false);
                setName("");
                router.refresh();
            } else {
                toast.error("Erro ao criar projeto", {
                    description: result.error || "Tente novamente",
                });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild={asChild ?? true}>
                {children || (
                    <Button size="lg">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Projeto
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Criar Novo Projeto</DialogTitle>
                        <DialogDescription>
                            Dê um nome para o seu projeto. Você pode alterá-lo depois.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="name">Nome do Projeto</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Meu Projeto Incrível"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isPending}
                            className="mt-2"
                            autoFocus
                            required
                            minLength={3}
                            maxLength={50}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending || !name.trim()}>
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Criar Projeto
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createTaskAction } from "@/app/(auth)/project/[id]/actions";
import { useRouter } from "next/navigation";
import type { ProjectMember, Priority } from "@/@types/project";

interface CreateTaskDialogProps {
    projectId: string;
    columnId: string;
    members: ProjectMember[];
    availableLabels: string[];
    children?: ReactNode;
}

export function CreateTaskDialog({ projectId, columnId, members, availableLabels, children }: CreateTaskDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority>("medium");
    const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Título é obrigatório");
            return;
        }

        startTransition(async () => {
            const result = await createTaskAction(projectId, {
                title: title.trim(),
                description: description.trim() || undefined,
                priority,
                columnId,
                assigneeId: assigneeId || undefined,
                labels: selectedLabels,
            });

            if (result.success) {
                toast.success("Tarefa criada com sucesso!");
                setOpen(false);
                // Reset form
                setTitle("");
                setDescription("");
                setPriority("medium");
                setAssigneeId(undefined);
                setSelectedLabels([]);
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao criar tarefa");
            }
        });
    };

    const toggleLabel = (label: string) => {
        setSelectedLabels((prev) =>
            prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Tarefa
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Criar Nova Tarefa</DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes da nova tarefa
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Título */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Digite o título da tarefa"
                            required
                        />
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Adicione uma descrição detalhada (opcional)"
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Prioridade */}
                        <div className="space-y-2">
                            <Label>Prioridade</Label>
                            <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Baixa</SelectItem>
                                    <SelectItem value="medium">Média</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                    <SelectItem value="urgent">Urgente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Responsável */}
                        <div className="space-y-2">
                            <Label>Responsável</Label>
                            <Select value={assigneeId} onValueChange={(value) => setAssigneeId(value || undefined)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Nenhum" />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map((member) => (
                                        <SelectItem key={member.user.id} value={member.user.id}>
                                            {member.user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Labels */}
                    {availableLabels.length > 0 && (
                        <div className="space-y-2">
                            <Label>Labels</Label>
                            <div className="flex flex-wrap gap-2">
                                {availableLabels.map((label) => (
                                    <Badge
                                        key={label}
                                        variant={selectedLabels.includes(label) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => toggleLabel(label)}
                                    >
                                        {label}
                                        {selectedLabels.includes(label) && (
                                            <X className="ml-1 h-3 w-3" />
                                        )}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Criando..." : "Criar Tarefa"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

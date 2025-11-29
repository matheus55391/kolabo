"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";
import { updateTaskAction } from "@/app/(auth)/project/[id]/actions";
import { useRouter } from "next/navigation";
import type { Task, ColumnWithTasks, ProjectMember, Priority } from "@/@types/project";

interface EditTaskDialogProps {
    task: Task;
    columns: ColumnWithTasks[];
    members: ProjectMember[];
    availableLabels: string[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({
    task,
    columns,
    members,
    availableLabels,
    open,
    onOpenChange,
}: EditTaskDialogProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Estados para edição
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [priority, setPriority] = useState(task.priority);
    const [assigneeId, setAssigneeId] = useState(task.assignee?.id || "unassigned");
    const [selectedLabels, setSelectedLabels] = useState<string[]>(task.labels);

    // Encontrar coluna atual
    const currentColumn = columns.find((col) => {
        return col.tasks.some((t) => t.id === task.id);
    });
    const initialColumnId = currentColumn?.id || (columns.length > 0 ? columns[0].id : "");
    const [columnId, setColumnId] = useState(initialColumnId);

    const handleUpdate = async () => {
        if (!title.trim()) {
            toast.error("Título é obrigatório");
            return;
        }

        startTransition(async () => {
            const result = await updateTaskAction(task.id, {
                title: title.trim(),
                description: description.trim() || undefined,
                priority: priority as Priority,
                columnId,
                assigneeId: assigneeId === "unassigned" ? null : assigneeId,
                labels: selectedLabels,
            });

            if (result.success) {
                toast.success("Tarefa atualizada!");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao atualizar tarefa");
            }
        });
    };

    const toggleLabel = (label: string) => {
        setSelectedLabels((prev) =>
            prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
        );
    };

    const handleCancel = () => {
        setTitle(task.title);
        setDescription(task.description || "");
        setPriority(task.priority);
        setColumnId(initialColumnId);
        setAssigneeId(task.assignee?.id || "unassigned");
        setSelectedLabels(task.labels);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Tarefa</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Título */}
                    <div>
                        <Label>Título</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-2"
                            placeholder="Título da tarefa"
                        />
                    </div>

                    {/* Descrição */}
                    <div>
                        <Label>Descrição</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                            className="mt-2 resize-none w-full whitespace-pre-wrap break-all"
                            placeholder="Adicione uma descrição..."
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <Label>Status</Label>
                        <Select value={columnId} onValueChange={setColumnId}>
                            <SelectTrigger className="mt-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {columns.map((column) => (
                                    <SelectItem key={column.id} value={column.id}>
                                        {column.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Prioridade */}
                    <div>
                        <Label>Prioridade</Label>
                        <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger className="mt-2">
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
                    <div>
                        <Label>Responsável</Label>
                        <Select value={assigneeId} onValueChange={setAssigneeId}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Nenhum" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned">Nenhum</SelectItem>
                                {members.map((member) => (
                                    <SelectItem key={member.user.id} value={member.user.id}>
                                        {member.user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Labels */}
                    <div>
                        <Label>Labels</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {availableLabels.map((label) => (
                                <Badge
                                    key={label}
                                    variant={selectedLabels.includes(label) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleLabel(label)}
                                >
                                    {label}
                                    {selectedLabels.includes(label) && <X className="ml-1 h-3 w-3" />}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isPending}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleUpdate} disabled={isPending}>
                        {isPending ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

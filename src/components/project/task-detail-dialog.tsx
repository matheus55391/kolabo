"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    AlertCircle,
    ArrowUp,
    ArrowDown,
    Minus,
    Trash2,
    X,
    Send,
} from "lucide-react";
import { toast } from "sonner";
import { updateTaskAction, deleteTaskAction, addCommentAction } from "@/app/(auth)/project/[id]/actions";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import type { Task, Column, ProjectMember, Comment, ActivityLog, Priority } from "@/@types/project";

interface TaskDetailDialogProps {
    task: Task;
    projectId: string;
    columns: Column[];
    members: ProjectMember[];
    availableLabels: string[];
    currentUserId: string;
    userRole: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const priorityConfig = {
    low: { label: "Baixa", icon: ArrowDown, color: "text-blue-500" },
    medium: { label: "Média", icon: Minus, color: "text-yellow-500" },
    high: { label: "Alta", icon: ArrowUp, color: "text-orange-500" },
    urgent: { label: "Urgente", icon: AlertCircle, color: "text-red-500" },
};

async function fetchTaskDetails(taskId: string) {
    const res = await fetch(`/api/tasks/${taskId}`);
    if (!res.ok) throw new Error("Erro ao buscar detalhes da tarefa");
    return res.json();
}

export function TaskDetailDialog({
    task,
    projectId,
    columns,
    members,
    availableLabels,
    currentUserId,
    userRole,
    open,
    onOpenChange,
}: TaskDetailDialogProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Estados para edição
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [priority, setPriority] = useState(task.priority);
    const [columnId, setColumnId] = useState("");
    const [assigneeId, setAssigneeId] = useState(task.assignee?.id || "");
    const [selectedLabels, setSelectedLabels] = useState<string[]>(task.labels);

    // Comentário
    const [commentContent, setCommentContent] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [activities, setActivities] = useState<ActivityLog[]>([]);

    // Tab ativa
    const [activeTab, setActiveTab] = useState<"comments" | "activity">("comments");

    // Inicializar coluna atual
    const currentColumn = columns.find((col) => {
        return col.tasks?.some((t: { id: string }) => t.id === task.id);
    });

    const initialColumnId = currentColumn?.id || (columns.length > 0 ? columns[0].id : "");

    useEffect(() => {
        setColumnId(initialColumnId);
    }, [initialColumnId]);

    // Buscar comentários e atividades com TanStack Query
    const { data: taskDetails } = useQuery({
        queryKey: ["task-details", task.id],
        queryFn: () => fetchTaskDetails(task.id),
        enabled: open,
    });

    // Sincronizar comentários e atividades do query
    const currentComments = taskDetails?.comments || [];
    const currentActivities = taskDetails?.activities || [];

    useEffect(() => {
        setComments(currentComments);
        setActivities(currentActivities);
    }, [JSON.stringify(currentComments), JSON.stringify(currentActivities)]);

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
                assigneeId: assigneeId || null,
                labels: selectedLabels,
            });

            if (result.success) {
                toast.success("Tarefa atualizada!");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao atualizar tarefa");
            }
        });
    };

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

        startTransition(async () => {
            const result = await deleteTaskAction(task.id);

            if (result.success) {
                toast.success("Tarefa excluída!");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao excluir tarefa");
            }
        });
    };

    const handleAddComment = async () => {
        if (!commentContent.trim()) return;

        startTransition(async () => {
            const result = await addCommentAction(task.id, commentContent.trim());

            if (result.success && result.data) {
                toast.success("Comentário adicionado!");
                setCommentContent("");
                router.refresh();
                // Atualizar lista de comentários
                setComments((prev) => [...prev, result.data!]);
            } else {
                toast.error(result.error || "Erro ao adicionar comentário");
            }
        });
    };

    const toggleLabel = (label: string) => {
        setSelectedLabels((prev) =>
            prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
        );
    };

    const PriorityIcon = priorityConfig[priority as keyof typeof priorityConfig]?.icon || Minus;
    const priorityColor = priorityConfig[priority as keyof typeof priorityConfig]?.color || "text-gray-500";
    const priorityLabel = priorityConfig[priority as keyof typeof priorityConfig]?.label || priority;

    const canEdit = userRole === "owner" || userRole === "admin" || task.creator.id === currentUserId;
    const canDelete = userRole === "owner" || userRole === "admin" || task.creator.id === currentUserId;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            {isEditing ? (
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="text-xl font-semibold"
                                />
                            ) : (
                                <DialogTitle className="text-xl">{task.title}</DialogTitle>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {canEdit && !isEditing && (
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                    Editar
                                </Button>
                            )}
                            {canDelete && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleDelete}
                                    disabled={isPending}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-6">
                    {/* Coluna Principal */}
                    <div className="col-span-2 space-y-6">
                        {/* Descrição */}
                        <div>
                            <Label className="text-sm font-semibold">Descrição</Label>
                            {isEditing ? (
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={6}
                                    className="mt-2"
                                    placeholder="Adicione uma descrição..."
                                />
                            ) : (
                                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                                    {task.description || "Sem descrição"}
                                </p>
                            )}
                        </div>

                        {/* Tabs: Comentários / Atividade */}
                        <div>
                            <div className="flex gap-4 border-b">
                                <button
                                    className={`pb-2 text-sm font-medium transition-colors ${activeTab === "comments"
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-muted-foreground"
                                        }`}
                                    onClick={() => setActiveTab("comments")}
                                >
                                    Comentários ({task._count.comments})
                                </button>
                                <button
                                    className={`pb-2 text-sm font-medium transition-colors ${activeTab === "activity"
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-muted-foreground"
                                        }`}
                                    onClick={() => setActiveTab("activity")}
                                >
                                    Atividade
                                </button>
                            </div>

                            <div className="mt-4">
                                {activeTab === "comments" ? (
                                    <div className="space-y-4">
                                        {/* Adicionar Comentário */}
                                        <div className="flex gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>U</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 flex gap-2">
                                                <Input
                                                    value={commentContent}
                                                    onChange={(e) => setCommentContent(e.target.value)}
                                                    placeholder="Adicione um comentário..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleAddComment();
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    size="icon"
                                                    onClick={handleAddComment}
                                                    disabled={!commentContent.trim() || isPending}
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Lista de Comentários */}
                                        {comments.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-8">
                                                Nenhum comentário ainda
                                            </p>
                                        ) : (
                                            <div className="space-y-4">
                                                {comments.map((comment) => (
                                                    <div key={comment.id} className="flex gap-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={comment.author.image || undefined} />
                                                            <AvatarFallback>
                                                                {comment.author.name[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="bg-muted rounded-lg p-3">
                                                                <p className="text-sm font-medium">
                                                                    {comment.author.name}
                                                                </p>
                                                                <p className="text-sm mt-1">{comment.content}</p>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {format(new Date(comment.createdAt), "PPp", {
                                                                    locale: ptBR,
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {activities.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-8">
                                                Nenhuma atividade registrada
                                            </p>
                                        ) : (
                                            activities.map((activity) => (
                                                <div key={activity.id} className="flex gap-3 text-sm">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={activity.user.image || undefined} />
                                                        <AvatarFallback className="text-xs">
                                                            {activity.user.name[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="text-muted-foreground">
                                                            {activity.description}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {format(new Date(activity.createdAt), "PPp", {
                                                                locale: ptBR,
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar de Detalhes */}
                    <div className="space-y-4">
                        {/* Status */}
                        <div>
                            <Label className="text-xs font-semibold text-muted-foreground">STATUS</Label>
                            {isEditing ? (
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
                            ) : (
                                <p className="text-sm mt-2">
                                    {columns.find((col) => col.id === columnId)?.name || "N/A"}
                                </p>
                            )}
                        </div>

                        <Separator />

                        {/* Prioridade */}
                        <div>
                            <Label className="text-xs font-semibold text-muted-foreground">PRIORIDADE</Label>
                            {isEditing ? (
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
                            ) : (
                                <div className={`flex items-center gap-2 mt-2 ${priorityColor}`}>
                                    <PriorityIcon className="h-4 w-4" />
                                    <span className="text-sm">{priorityLabel}</span>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Responsável */}
                        <div>
                            <Label className="text-xs font-semibold text-muted-foreground">RESPONSÁVEL</Label>
                            {isEditing ? (
                                <Select value={assigneeId} onValueChange={setAssigneeId}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Nenhum</SelectItem>
                                        {members.map((member) => (
                                            <SelectItem key={member.user.id} value={member.user.id}>
                                                {member.user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : task.assignee ? (
                                <div className="flex items-center gap-2 mt-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={task.assignee.image || undefined} />
                                        <AvatarFallback className="text-xs">
                                            {task.assignee.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{task.assignee.name}</span>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground mt-2">Não atribuído</p>
                            )}
                        </div>

                        <Separator />

                        {/* Labels */}
                        <div>
                            <Label className="text-xs font-semibold text-muted-foreground">LABELS</Label>
                            {isEditing ? (
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
                            ) : task.labels.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {task.labels.map((label) => (
                                        <Badge key={label} variant="secondary">
                                            {label}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground mt-2">Sem labels</p>
                            )}
                        </div>

                        <Separator />

                        {/* Criador */}
                        <div>
                            <Label className="text-xs font-semibold text-muted-foreground">CRIADO POR</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={task.creator.image || undefined} />
                                    <AvatarFallback className="text-xs">{task.creator.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{task.creator.name}</span>
                            </div>
                        </div>

                        {/* Datas */}
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>
                                Criado em {format(new Date(task.createdAt), "PPp", { locale: ptBR })}
                            </p>
                            <p>
                                Atualizado em {format(new Date(task.updatedAt), "PPp", { locale: ptBR })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botões de Ação (quando editando) */}
                {isEditing && (
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditing(false);
                                setTitle(task.title);
                                setDescription(task.description || "");
                                setPriority(task.priority);
                                setSelectedLabels(task.labels);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdate} disabled={isPending}>
                            {isPending ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

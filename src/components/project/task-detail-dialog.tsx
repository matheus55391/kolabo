"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertCircle,
    ArrowUp,
    ArrowDown,
    Minus,
    Trash2,
    Send,
} from "lucide-react";
import { toast } from "sonner";
import { deleteTaskAction, addCommentAction, updateTaskAction, getTaskDetailsAction } from "@/app/(auth)/project/[id]/actions";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Task, ColumnWithTasks, ProjectMember, Comment, ActivityLog, Priority } from "@/@types/project";
import { EditTaskDialog } from "./edit-task-dialog";

interface TaskDetailDialogProps {
    task: Task;
    projectId: string;
    columns: ColumnWithTasks[];
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
    const result = await getTaskDetailsAction(taskId);
    if (!result.success) throw new Error(result.error);
    return result.data;
}

export function TaskDetailDialog({
    task,
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
    const queryClient = useQueryClient();

    // Estado para dialog de edição
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Comentário
    const [commentContent, setCommentContent] = useState("");

    // Tab ativa
    const [activeTab, setActiveTab] = useState<"comments" | "activity">("comments");

    // Coluna atual
    const currentColumn = columns.find((col) => {
        return col.tasks.some((t) => t.id === task.id);
    });

    // Buscar comentários e atividades com TanStack Query
    const { data: taskDetails } = useQuery({
        queryKey: ["task-details", task.id],
        queryFn: () => fetchTaskDetails(task.id),
        enabled: open,
    });

    // Usar diretamente os dados da query
    const comments = taskDetails?.comments || [];
    const activities = taskDetails?.activities || [];

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

        const tempComment: Comment = {
            id: `temp-${Date.now()}`,
            content: commentContent.trim(),
            createdAt: new Date(),
            updatedAt: new Date(),
            taskId: task.id,
            authorId: currentUserId,
            author: {
                id: currentUserId,
                name: "Você",
                email: "",
                image: null,
            },
        };

        // Adicionar comentário localmente de forma otimista
        queryClient.setQueryData(["task-details", task.id], (old: { comments?: Comment[], activities?: ActivityLog[] } | undefined) => {
            if (!old) return old;
            return {
                ...old,
                comments: [...(old.comments || []), tempComment],
            };
        });

        setCommentContent("");

        startTransition(async () => {
            const result = await addCommentAction(task.id, tempComment.content);

            if (result.success && result.data) {
                toast.success("Comentário adicionado!");
                // Revalidar em background
                queryClient.invalidateQueries({ queryKey: ["task-details", task.id] });
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao adicionar comentário");
                // Remover comentário temporário em caso de erro
                queryClient.setQueryData(["task-details", task.id], (old: { comments?: Comment[], activities?: ActivityLog[] } | undefined) => {
                    if (!old) return old;
                    return {
                        ...old,
                        comments: old.comments?.filter((c: Comment) => c.id !== tempComment.id) || [],
                    };
                });
            }
        });
    };

    const handleStatusChange = async (newColumnId: string) => {
        startTransition(async () => {
            const result = await updateTaskAction(task.id, {
                title: task.title,
                description: task.description || undefined,
                priority: task.priority as Priority,
                columnId: newColumnId,
                assigneeId: task.assignee?.id || null,
                labels: task.labels,
            });

            if (result.success) {
                toast.success("Status atualizado!");
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao atualizar status");
            }
        });
    };

    const PriorityIcon = priorityConfig[task.priority as keyof typeof priorityConfig]?.icon || Minus;
    const priorityColor = priorityConfig[task.priority as keyof typeof priorityConfig]?.color || "text-gray-500";
    const priorityLabel = priorityConfig[task.priority as keyof typeof priorityConfig]?.label || task.priority;

    const canEdit = userRole === "owner" || userRole === "admin" || task.creator.id === currentUserId;
    const canDelete = userRole === "owner" || userRole === "admin" || task.creator.id === currentUserId;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] min-w-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <DialogTitle className="text-xl">{task.title}</DialogTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                {canEdit && (
                                    <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
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
                                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                                    {task.description || "Sem descrição"}
                                </p>
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
                                        Comentários
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
                                                    {comments.map((comment: Comment) => (
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
                                                activities.map((activity: ActivityLog) => (
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
                                {canEdit ? (
                                    <Select
                                        value={currentColumn?.id || ""}
                                        onValueChange={handleStatusChange}
                                        disabled={isPending}
                                    >
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
                                        {currentColumn?.name || "N/A"}
                                    </p>
                                )}
                            </div>

                            <Separator />

                            {/* Prioridade */}
                            <div>
                                <Label className="text-xs font-semibold text-muted-foreground">PRIORIDADE</Label>
                                <div className={`flex items-center gap-2 mt-2 ${priorityColor}`}>
                                    <PriorityIcon className="h-4 w-4" />
                                    <span className="text-sm">{priorityLabel}</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Responsável */}
                            <div>
                                <Label className="text-xs font-semibold text-muted-foreground">RESPONSÁVEL</Label>
                                {task.assignee ? (
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
                                {task.labels.length > 0 ? (
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
                </DialogContent>
            </Dialog>

            {/* Dialog de Edição */}
            <EditTaskDialog
                task={task}
                columns={columns}
                members={members}
                availableLabels={availableLabels}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            />
        </>
    );
}

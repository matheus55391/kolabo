"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, AlertCircle, ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { Task } from "@/@types/project";

interface TaskCardProps {
    task: Task;
    onClick: () => void;
}

const priorityConfig = {
    low: { icon: ArrowDown, color: "text-blue-500", bg: "bg-blue-500/10" },
    medium: { icon: Minus, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    high: { icon: ArrowUp, color: "text-orange-500", bg: "bg-orange-500/10" },
    urgent: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
};

export function TaskCard({ task, onClick }: TaskCardProps) {
    const PriorityIcon = priorityConfig[task.priority as keyof typeof priorityConfig]?.icon || Minus;
    const priorityColor = priorityConfig[task.priority as keyof typeof priorityConfig]?.color || "text-gray-500";
    const priorityBg = priorityConfig[task.priority as keyof typeof priorityConfig]?.bg || "bg-gray-500/10";

    return (
        <Card
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={onClick}
        >
            <div className="space-y-3">
                {/* Título */}
                <h3 className="font-medium text-sm leading-tight">{task.title}</h3>

                {/* Labels */}
                {task.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {task.labels.map((label) => (
                            <Badge key={label} variant="secondary" className="text-xs">
                                {label}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Prioridade */}
                        <div className={`flex items-center gap-1 px-2 py-1 rounded ${priorityBg}`}>
                            <PriorityIcon className={`h-3 w-3 ${priorityColor}`} />
                        </div>

                        {/* Comentários */}
                        {task._count?.comments && task._count.comments > 0 && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <MessageSquare className="h-3 w-3" />
                                <span className="text-xs">{task._count.comments}</span>
                            </div>
                        )}
                    </div>

                    {/* Assignee */}
                    {task.assignee && (
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.image || undefined} />
                            <AvatarFallback className="text-xs">
                                {task.assignee.name[0]}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </div>
            </div>
        </Card>
    );
}

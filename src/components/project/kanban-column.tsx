"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, Settings } from "lucide-react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CreateTaskDialog } from "./create-task-dialog";
import { EditColumnDialog } from "./edit-column-dialog";
import { SortableTaskCard } from "./sortable-task-card";
import type { Project, Task } from "@/@types/project";

interface KanbanColumnProps {
    column: Project["columns"][0];
    project: Project;
    tasks: Task[];
    onTaskClick: (taskId: string) => void;
}

export function KanbanColumn({ column, project, tasks, onTaskClick }: KanbanColumnProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: column.id,
        data: {
            type: "column",
            column,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="shrink-0 w-80 flex flex-col">
            <Card className="flex flex-col h-full">
                <CardHeader className="shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                            <button
                                {...attributes}
                                {...listeners}
                                className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                            >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <CardTitle className="text-base flex items-center gap-2">
                                {column.name}
                                <Badge variant="secondary" className="text-xs">
                                    {tasks.length}
                                </Badge>
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-1">
                            <EditColumnDialog columnId={column.id} columnName={column.name} hasBlocks={tasks.length > 0}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </EditColumnDialog>
                            <CreateTaskDialog
                                projectId={project.id}
                                columnId={column.id}
                                members={project.members}
                                availableLabels={project.labels}
                            >
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </CreateTaskDialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
                    <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                        {tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <CreateTaskDialog
                                    projectId={project.id}
                                    columnId={column.id}
                                    members={project.members}
                                    availableLabels={project.labels}
                                >
                                    <Button variant="link">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Adicionar tarefa
                                    </Button>
                                </CreateTaskDialog>
                            </div>
                        ) : (
                            tasks.map((task) => (
                                <SortableTaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
                            ))
                        )}
                    </SortableContext>
                </CardContent>
            </Card>
        </div>
    );
}

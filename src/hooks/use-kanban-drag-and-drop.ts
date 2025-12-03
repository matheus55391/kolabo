"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import type { Project, Task } from "@/@types/project";
import { reorderColumnsAction, reorderTasksAction } from "@/app/(auth)/project/[id]/actions";

export function useKanbanDragAndDrop(initialColumns: Project["columns"], projectId: string) {
    // Garantir que colunas e tasks estejam ordenadas desde o início
    const sortedInitialColumns = initialColumns.map(col => ({
        ...col,
        tasks: [...col.tasks].sort((a, b) => a.order - b.order)
    }));

    const [columns, setColumns] = useState(sortedInitialColumns);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [, startTransition] = useTransition();
    const router = useRouter();

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeData = active.data.current;
        const overData = over.data.current;

        // Se arrastar task sobre task
        if (activeData?.type === "task" && overData?.type === "task") {
            const activeTask = activeData.task as Task;
            const overTask = overData.task as Task;

            const activeColumnId = activeTask.columnId;
            const overColumnId = overTask.columnId;

            if (activeColumnId !== overColumnId) {
                // Mover task para outra coluna
                setColumns((prevColumns) => {
                    const newColumns = prevColumns.map((col) => {
                        if (col.id === activeColumnId) {
                            return {
                                ...col,
                                tasks: col.tasks.filter((t) => t.id !== activeTask.id),
                            };
                        }
                        if (col.id === overColumnId) {
                            const overIndex = col.tasks.findIndex((t) => t.id === overTask.id);
                            const newTasks = [...col.tasks];
                            newTasks.splice(overIndex, 0, { ...activeTask, columnId: overColumnId });
                            return { ...col, tasks: newTasks };
                        }
                        return col;
                    });
                    return newColumns;
                });
            } else {
                // Reordenar na mesma coluna
                setColumns((prevColumns) => {
                    const newColumns = prevColumns.map((col) => {
                        if (col.id === activeColumnId) {
                            const oldIndex = col.tasks.findIndex((t) => t.id === activeTask.id);
                            const newIndex = col.tasks.findIndex((t) => t.id === overTask.id);
                            return { ...col, tasks: arrayMove(col.tasks, oldIndex, newIndex) };
                        }
                        return col;
                    });
                    return newColumns;
                });
            }
        }

        // Se arrastar task sobre coluna vazia
        if (activeData?.type === "task" && overData?.type === "column") {
            const activeTask = activeData.task as Task;
            const overColumn = overData.column as Project["columns"][0];

            if (activeTask.columnId !== overColumn.id) {
                setColumns((prevColumns) => {
                    const newColumns = prevColumns.map((col) => {
                        if (col.id === activeTask.columnId) {
                            return {
                                ...col,
                                tasks: col.tasks.filter((t) => t.id !== activeTask.id),
                            };
                        }
                        if (col.id === overColumn.id) {
                            return {
                                ...col,
                                tasks: [...col.tasks, { ...activeTask, columnId: overColumn.id }],
                            };
                        }
                        return col;
                    });
                    return newColumns;
                });
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;

        if (!over) return;

        const activeData = active.data.current;

        // Se foi drag de coluna
        if (activeData?.type === "column") {
            const oldIndex = columns.findIndex((col) => col.id === active.id);
            const newIndex = columns.findIndex((col) => col.id === over.id);

            if (oldIndex !== newIndex) {
                const newColumns = arrayMove(columns, oldIndex, newIndex);
                setColumns(newColumns);

                startTransition(async () => {
                    const columnsWithOrder = newColumns.map((col, index) => ({
                        id: col.id,
                        order: index,
                    }));

                    const result = await reorderColumnsAction(projectId, columnsWithOrder);

                    if (result.success) {
                        toast.success("Colunas reordenadas!");
                        router.refresh();
                    } else {
                        toast.error(result.error || "Erro ao reordenar colunas");
                        setColumns(initialColumns);
                    }
                });
            }
        }

        // Se foi drag de task
        if (activeData?.type === "task") {
            const activeTask = activeData.task as Task;
            const originalColumn = sortedInitialColumns.find((col) =>
                col.tasks.some((t) => t.id === activeTask.id)
            );
            const currentColumn = columns.find((col) =>
                col.tasks.some((t) => t.id === activeTask.id)
            );

            if (!currentColumn || !originalColumn) return;

            // Verificar se houve mudança de coluna
            const columnChanged = currentColumn.id !== originalColumn.id;

            // Verificar se houve mudança de ordem dentro da mesma coluna
            const originalTaskIndex = originalColumn.tasks.findIndex((t) => t.id === activeTask.id);
            const currentTaskIndex = currentColumn.tasks.findIndex((t) => t.id === activeTask.id);
            const orderChanged = columnChanged || originalTaskIndex !== currentTaskIndex;

            if (!orderChanged) return; // Não houve mudança real

            // Preparar dados para atualização - mapear todas as tasks da coluna afetada
            const tasksWithOrder = currentColumn.tasks.map((task, index) => ({
                id: task.id,
                order: index,
                columnId: currentColumn.id,
            }));

            // Se mudou de coluna, incluir tasks da coluna origem também
            let allTasksToUpdate = tasksWithOrder;
            if (columnChanged && originalColumn.id !== currentColumn.id) {
                const originalColumnTasks = columns
                    .find(col => col.id === originalColumn.id)
                    ?.tasks.map((task, index) => ({
                        id: task.id,
                        order: index,
                        columnId: originalColumn.id,
                    })) || [];
                allTasksToUpdate = [...tasksWithOrder, ...originalColumnTasks];
            }

            // Task mudou de coluna ou ordem - atualizar no servidor
            startTransition(async () => {
                const result = await reorderTasksAction(projectId, allTasksToUpdate);

                if (result.success) {
                    toast.success(columnChanged ? "Tarefa movida!" : "Ordem atualizada!");
                    router.refresh();
                } else {
                    toast.error(result.error || "Erro ao atualizar tarefa");
                    setColumns(sortedInitialColumns);
                }
            });
        }
    };

    return {
        columns,
        activeId,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        setColumns,
    };
}

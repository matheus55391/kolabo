"use client";

import { useState, useEffect } from "react";
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    closestCorners,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "@/components/project/task-card";
import { TaskDetailDialog } from "@/components/project/task-detail-dialog";
import { BoardHeader } from "@/components/project/board-header";
import { KanbanColumn } from "@/components/project/kanban-column";
import { useKanbanDragAndDrop } from "@/hooks/use-kanban-drag-and-drop";
import { ColumnsProvider, useColumns } from "@/contexts/columns-context";
import type { Project } from "@/@types/project";

interface ProjectBoardProps {
    project: Project;
    currentUserId: string;
    userRole: string;
}

function ProjectBoardContent({ project, currentUserId, userRole }: ProjectBoardProps) {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const { columns: contextColumns } = useColumns();
    const { columns, activeId, handleDragStart, handleDragOver, handleDragEnd, setColumns } = useKanbanDragAndDrop(
        contextColumns,
        project.id
    );

    // Sincronizar com contexto
    useEffect(() => {
        setColumns(contextColumns);
    }, [contextColumns, setColumns]);

    // Previne erro de hidratação do @dnd-kit
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    // Organizar tasks por coluna
    const tasksByColumn: Record<string, typeof project.columns[0]["tasks"]> = {};
    columns.forEach((column) => {
        tasksByColumn[column.id] = column.tasks;
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const selectedTask = selectedTaskId
        ? columns.flatMap((col) => col.tasks).find((task) => task.id === selectedTaskId)
        : null;

    return (
        <>
            <BoardHeader project={project} />

            {/* Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden bg-muted/30">
                <div className="container mx-auto max-w-7xl px-6 py-6 h-full" suppressHydrationWarning>
                    {!isMounted ? (
                        // Renderiza versão estática durante SSR
                        <div className="flex gap-6 h-full">
                            {columns.map((column) => (
                                <KanbanColumn
                                    key={column.id}
                                    column={column}
                                    project={project}
                                    tasks={tasksByColumn[column.id] || []}
                                    onTaskClick={setSelectedTaskId}
                                />
                            ))}
                        </div>
                    ) : (
                        // Renderiza com drag and drop após montar no cliente
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={columns.map((col) => col.id)} strategy={horizontalListSortingStrategy}>
                                <div className="flex gap-6 h-full">
                                    {columns.map((column) => (
                                        <KanbanColumn
                                            key={column.id}
                                            column={column}
                                            project={project}
                                            tasks={tasksByColumn[column.id] || []}
                                            onTaskClick={setSelectedTaskId}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                            <DragOverlay>
                                {activeId ? (
                                    (() => {
                                        const task = columns
                                            .flatMap((col) => col.tasks)
                                            .find((t) => t.id === activeId);
                                        return task ? <TaskCard task={task} onClick={() => { }} /> : null;
                                    })()
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    )}
                </div>
            </div>

            {/* Task Detail Dialog */}
            {selectedTask && (
                <TaskDetailDialog
                    task={selectedTask}
                    projectId={project.id}
                    columns={project.columns}
                    members={project.members}
                    availableLabels={project.labels}
                    currentUserId={currentUserId}
                    userRole={userRole}
                    open={!!selectedTaskId}
                    onOpenChange={(open: boolean) => {
                        if (!open) setSelectedTaskId(null);
                    }}
                />
            )}
        </>
    );
}

export function ProjectBoard(props: ProjectBoardProps) {
    return (
        <ColumnsProvider initialColumns={props.project.columns}>
            <ProjectBoardContent {...props} />
        </ColumnsProvider>
    );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateTaskDialog } from "@/components/project/create-task-dialog";
import { TaskCard } from "@/components/project/task-card";
import { TaskDetailDialog } from "@/components/project/task-detail-dialog";
import type { Project } from "@/@types/project";

interface ProjectBoardProps {
    project: Project;
    currentUserId: string;
    userRole: string;
}

export function ProjectBoard({ project, currentUserId, userRole }: ProjectBoardProps) {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const selectedTask = selectedTaskId
        ? project.columns.flatMap((col) => col.tasks).find((task) => task.id === selectedTaskId)
        : null;

    return (
        <>
            {/* Header */}
            <div className="border-b bg-background">
                <div className="container mx-auto max-w-7xl px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">{project.name}</h1>
                                {project.description && (
                                    <p className="text-sm text-muted-foreground">{project.description}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Avatares dos membros */}
                            <div className="flex -space-x-2">
                                {project.members.slice(0, 5).map((member) => (
                                    <Avatar key={member.id} className="border-2 border-background">
                                        <AvatarImage src={member.user.image || undefined} />
                                        <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                                    </Avatar>
                                ))}
                                {project.members.length > 5 && (
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted border-2 border-background text-xs font-medium">
                                        +{project.members.length - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden bg-muted/30">
                <div className="container mx-auto max-w-7xl px-6 py-6 h-full">
                    <div className="flex gap-6 h-full">
                        {project.columns.map((column) => (
                            <div key={column.id} className="shrink-0 w-80 flex flex-col">
                                <Card className="flex flex-col h-full">
                                    <CardHeader className="shrink-0">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                {column.name}
                                                <Badge variant="secondary" className="text-xs">
                                                    {column.tasks.length}
                                                </Badge>
                                            </CardTitle>
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
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-y-auto space-y-3">
                                        {column.tasks.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                <p className="text-sm text-muted-foreground">
                                                    Nenhuma tarefa
                                                </p>
                                                <CreateTaskDialog
                                                    projectId={project.id}
                                                    columnId={column.id}
                                                    members={project.members}
                                                    availableLabels={project.labels}
                                                >
                                                    <Button variant="link" className="mt-2">
                                                        Adicionar tarefa
                                                    </Button>
                                                </CreateTaskDialog>
                                            </div>
                                        ) : (
                                            column.tasks.map((task) => (
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    onClick={() => setSelectedTaskId(task.id)}
                                                />
                                            ))
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
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

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Plus } from "lucide-react";
import { CreateColumnDialog } from "./create-column-dialog";
import type { Project } from "@/@types/project";

interface BoardHeaderProps {
    project: Project;
}

export function BoardHeader({ project }: BoardHeaderProps) {
    return (
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
                    <div className="flex items-center gap-3">
                        <CreateColumnDialog projectId={project.id}>
                            <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Nova Coluna
                            </Button>
                        </CreateColumnDialog>
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
    );
}

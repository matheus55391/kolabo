import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProjectBoard } from "@/components/project/project-board";

interface ProjectPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    // Buscar projeto com todas as informações necessárias
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                },
            },
            columns: {
                orderBy: {
                    order: "asc",
                },
                include: {
                    tasks: {
                        orderBy: {
                            order: "asc",
                        },
                        include: {
                            creator: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    image: true,
                                },
                            },
                            assignee: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    image: true,
                                },
                            },
                            _count: {
                                select: {
                                    comments: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!project) {
        notFound();
    }

    // Verificar se o usuário é membro do projeto
    const isMember = project.members.some((member) => member.userId === session.user.id);

    if (!isMember) {
        redirect("/dashboard");
    }

    // Encontrar o papel do usuário atual
    const currentUserMembership = project.members.find((member) => member.userId === session.user.id);

    return (
        <div className="h-screen flex flex-col">
            <ProjectBoard
                project={project}
                currentUserId={session.user.id}
                userRole={currentUserMembership?.role || "member"}
            />
        </div>
    );
}

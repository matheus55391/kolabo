import prisma from "@/lib/prisma";

export async function getProjectById(projectId: string) {
    return await prisma.project.findUnique({
        where: { id: projectId },
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
                        take: 100,
                    },
                },
            },
        },
    });
}

export async function getUserProjects(userId: string, limit: number = 50) {
    return await prisma.project.findMany({
        where: {
            members: {
                some: {
                    userId,
                },
            },
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            _count: {
                select: {
                    members: true,
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
        take: limit,
    });
}

export async function isUserProjectMember(projectId: string, userId: string) {
    const membership = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId,
            },
        },
    });

    return !!membership;
}

export async function getUserProjectRole(projectId: string, userId: string) {
    const membership = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId,
            },
        },
        select: {
            role: true,
        },
    });

    return membership?.role || "member";
}

export async function createProject(data: {
    name: string;
    description: string | null;
    ownerId: string;
}) {
    return await prisma.project.create({
        data: {
            name: data.name,
            description: data.description,
            ownerId: data.ownerId,
            members: {
                create: {
                    userId: data.ownerId,
                    role: "owner",
                },
            },
            columns: {
                create: [
                    { name: "A Fazer", order: 0 },
                    { name: "Em Progresso", order: 1 },
                    { name: "Concluído", order: 2 },
                ],
            },
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
}

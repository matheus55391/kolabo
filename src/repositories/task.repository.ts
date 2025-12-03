import prisma from "@/lib/prisma";

export async function getTaskById(taskId: string) {
    return await prisma.task.findUnique({
        where: { id: taskId },
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
            column: {
                select: {
                    id: true,
                    name: true,
                    projectId: true,
                },
            },
            _count: {
                select: {
                    comments: true,
                },
            },
        },
    });
}

export async function getTaskWithDetails(taskId: string) {
    return await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            comments: {
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "asc",
                },
            },
            activities: {
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
                orderBy: {
                    createdAt: "desc",
                },
            },
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
            column: {
                select: {
                    id: true,
                    name: true,
                    projectId: true,
                },
            },
        },
    });
}

export async function createTask(data: {
    title: string;
    description: string | null;
    priority: string;
    labels: string[];
    columnId: string;
    creatorId: string;
    assigneeId: string | null;
    projectId: string;
}) {
    // Obter a ordem máxima das tasks na coluna
    const maxOrder = await prisma.task.aggregate({
        where: { columnId: data.columnId },
        _max: { order: true },
    });

    const newOrder = (maxOrder._max.order ?? -1) + 1;

    return await prisma.task.create({
        data: {
            title: data.title,
            description: data.description,
            priority: data.priority,
            labels: data.labels,
            order: newOrder,
            columnId: data.columnId,
            creatorId: data.creatorId,
            assigneeId: data.assigneeId,
            projectId: data.projectId,
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
            column: {
                select: {
                    id: true,
                    name: true,
                    order: true,
                },
            },
        },
    });
}

export async function updateTask(taskId: string, data: {
    title?: string;
    description?: string | null;
    priority?: string;
    labels?: string[];
    columnId?: string;
    assigneeId?: string | null;
    order?: number;
}) {
    return await prisma.task.update({
        where: { id: taskId },
        data,
    });
}

export async function deleteTask(taskId: string) {
    return await prisma.task.delete({
        where: { id: taskId },
    });
}

export async function addComment(data: {
    content: string;
    taskId: string;
    authorId: string;
}) {
    return await prisma.comment.create({
        data: {
            content: data.content,
            taskId: data.taskId,
            authorId: data.authorId,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });
}

export async function addActivity(data: {
    action: string;
    field: string | null;
    oldValue: string | null;
    newValue: string | null;
    description: string;
    taskId: string;
    userId: string;
}) {
    return await prisma.activityLog.create({
        data,
    });
}

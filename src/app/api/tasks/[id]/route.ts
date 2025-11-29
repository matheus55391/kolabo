import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        // Buscar tarefa com comentários e atividades
        const task = await prisma.task.findUnique({
            where: { id },
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
            },
        });

        if (!task) {
            return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
        }

        // Verificar se o usuário tem acesso ao projeto
        const membership = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId: task.projectId,
                    userId: session.user.id,
                },
            },
        });

        if (!membership) {
            return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
        }

        return NextResponse.json({
            comments: task.comments,
            activities: task.activities,
        });
    } catch (error) {
        console.error("Erro ao buscar detalhes da tarefa:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

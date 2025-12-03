import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ProjectBoard } from "@/components/project/project-board";
import { getProjectById, getUserProjectRole } from "@/repositories/project.repository";

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

    // Buscar projeto
    const project = await getProjectById(id);

    if (!project) {
        notFound();
    }

    // Verificar se o usuário é membro do projeto
    const isMember = project.members.some((member) => member.userId === session.user.id);

    if (!isMember) {
        redirect("/dashboard");
    }

    // Obter papel do usuário
    const userRole = await getUserProjectRole(id, session.user.id);

    return (
        <div className="h-screen flex flex-col">
            <ProjectBoard
                project={project}
                currentUserId={session.user.id}
                userRole={userRole}
            />
        </div>
    );
}

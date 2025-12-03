import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus } from "lucide-react";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import Link from "next/link";
import { getUserProjects } from "@/repositories/project.repository";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return null;
    }

    // Buscar projetos do usuário
    const projects = await getUserProjects(session.user.id, 50);

    const firstName = session.user.name?.split(" ")[0] || "Usuário";

    return (
        <div className="container mx-auto max-w-7xl py-8 px-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                    Bem-vindo de volta, {firstName}! 👋
                </h1>
                <p className="text-muted-foreground mt-2">
                    Organize suas tarefas e colabore com sua equipe
                </p>
            </div>

            {/* Seus Projetos */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Seus Projetos</CardTitle>
                            <CardDescription>
                                {projects.length === 0
                                    ? "Crie seu primeiro projeto para começar"
                                    : `${projects.length} projeto${projects.length > 1 ? "s" : ""}`}
                            </CardDescription>
                        </div>
                        <CreateProjectDialog asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Projeto
                            </Button>
                        </CreateProjectDialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="rounded-full bg-primary/10 p-6 mb-4">
                                <FolderKanban className="h-12 w-12 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Nenhum projeto ainda</h3>
                            <p className="text-muted-foreground text-center mb-6 max-w-md">
                                Organize suas tarefas e colabore com sua equipe criando seu primeiro projeto no Kolabo
                            </p>
                            <CreateProjectDialog />
                        </div>
                    ) : (
                        <div className="divide-y">
                            {projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/project/${project.id}`}
                                    className="flex items-center justify-between py-4 hover:bg-muted/50 transition-colors cursor-pointer rounded-lg px-3 -mx-3"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                                            <FolderKanban className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{project.name}</h3>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {project.description || "Sem descrição"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-muted-foreground shrink-0">
                                        <span>{project._count.members} membro{project._count.members > 1 ? "s" : ""}</span>
                                        <span className="hidden md:inline">por {project.owner.name}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

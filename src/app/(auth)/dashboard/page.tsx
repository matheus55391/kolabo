import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, LayoutDashboard, Users, Plus } from "lucide-react";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const firstName = session?.user?.name?.split(" ")[0] || "Usuário";

    return (
        <div className="container py-8 px-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                    Bem-vindo de volta, {firstName}! 👋
                </h1>
                <p className="text-muted-foreground mt-2">
                    Aqui está um resumo dos seus projetos e tarefas
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Comece criando seu primeiro projeto
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Nenhuma tarefa pendente
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tarefas Concluídas</CardTitle>
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Continue assim!
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Membros da Equipe</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground">
                            Você
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Empty State */}
            <Card>
                <CardHeader>
                    <CardTitle>Seus Projetos</CardTitle>
                    <CardDescription>
                        Você ainda não tem nenhum projeto. Crie um para começar!
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-primary/10 p-6 mb-4">
                        <FolderKanban className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Nenhum projeto ainda</h3>
                    <p className="text-muted-foreground text-center mb-6 max-w-md">
                        Organize suas tarefas e colabore com sua equipe criando seu primeiro projeto no Kolabo
                    </p>
                    <Button size="lg">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Projeto
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Users, Zap, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">K</span>
            </div>
            <span className="font-bold text-xl">Kolabo</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Começar Grátis</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="flex flex-col items-center text-center gap-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm">
            <Zap className="mr-2 h-4 w-4" />
            <span>Organize projetos de forma visual e intuitiva</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Gerencie seus projetos com{" "}
            <span className="text-primary">eficiência</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl">
            Kolabo é uma plataforma de organização de projetos que ajuda equipes a
            colaborar melhor e entregar mais rápido. Simples como um quadro, poderoso como uma ferramenta profissional.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Começar Agora - É Grátis
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa para organizar projetos
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ferramentas simples e poderosas para manter sua equipe produtiva
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Quadros Kanban</CardTitle>
              <CardDescription>
                Visualize o fluxo de trabalho com quadros personalizáveis estilo Trello
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Colaboração em Tempo Real</CardTitle>
              <CardDescription>
                Trabalhe junto com sua equipe, atribua tarefas e acompanhe o progresso
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Relatórios e Métricas</CardTitle>
              <CardDescription>
                Acompanhe o desempenho do projeto com dashboards intuitivos
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Junte-se a milhares de equipes que já estão organizando seus projetos com Kolabo
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Criar Conta Gratuita
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Kolabo. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

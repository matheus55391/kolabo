# Repository Pattern - Kolabo

Este projeto utiliza o **Repository Pattern** para abstrair e centralizar o acesso ao banco de dados através do Prisma.

## 📁 Estrutura

```
src/
  repositories/
    project.repository.ts  # Operações relacionadas a projetos
    task.repository.ts     # Operações relacionadas a tarefas
```

## 🎯 Benefícios

1. **Desacoplamento**: Pages e Actions não dependem diretamente do Prisma
2. **Reutilização**: Queries complexas podem ser reutilizadas em múltiplos lugares
3. **Manutenibilidade**: Mudanças nas queries ficam centralizadas
4. **Testabilidade**: Fácil mockar repositories em testes
5. **Legibilidade**: Código mais limpo e expressivo

## 📝 Exemplo de Uso

### ❌ Antes (Query verbosa na rota)

```typescript
// page.tsx
const project = await prisma.project.findUnique({
  where: { id },
  include: {
    owner: { select: { id: true, name: true, email: true, image: true } },
    members: {
      include: {
        user: { select: { id: true, name: true, email: true, image: true } }
      }
    },
    columns: {
      orderBy: { order: "asc" },
      include: {
        tasks: {
          orderBy: { order: "asc" },
          include: {
            creator: { select: { id: true, name: true, email: true, image: true } },
            assignee: { select: { id: true, name: true, email: true, image: true } },
            _count: { select: { comments: true } }
          }
        }
      }
    }
  }
});
```

### ✅ Depois (Repository limpo)

```typescript
// page.tsx
import { getProjectById } from "@/repositories/project.repository";

const project = await getProjectById(id);
```

## 🔧 Repositories Disponíveis

### Project Repository

```typescript
import {
  getProjectById,           // Busca projeto completo com colunas e tasks
  getUserProjects,          // Lista projetos do usuário (paginado)
  isUserProjectMember,      // Verifica se usuário é membro
  getUserProjectRole,       // Retorna papel do usuário no projeto
  createProject,            // Cria projeto com colunas padrão
} from "@/repositories/project.repository";
```

### Task Repository

```typescript
import {
  getTaskById,              // Busca task básica
  getTaskWithDetails,       // Busca task com comments e activities
  createTask,               // Cria task com ordem automática
  updateTask,               // Atualiza task
  deleteTask,               // Remove task
  addComment,               // Adiciona comentário
  addActivity,              // Registra atividade
} from "@/repositories/task.repository";
```

## 📊 Otimizações Implementadas

1. **Paginação**: `getUserProjects()` aceita limit (padrão 50)
2. **Lazy Loading**: Tasks limitadas a 100 por coluna
3. **Select Otimizado**: Busca apenas campos necessários
4. **Cache**: Queries reutilizáveis reduzem duplicação

## 🚀 Como Adicionar Novo Repository

1. Criar arquivo em `src/repositories/[entidade].repository.ts`
2. Exportar funções públicas
3. Manter queries Prisma encapsuladas
4. Documentar parâmetros e retornos

```typescript
// exemplo.repository.ts
import prisma from "@/lib/prisma";

export async function getExemploById(id: string) {
  return await prisma.exemplo.findUnique({
    where: { id },
    include: {
      // ... includes necessários
    },
  });
}
```

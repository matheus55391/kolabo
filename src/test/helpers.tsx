import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactElement } from 'react'
import { vi } from 'vitest'

// Mock data generators
export const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.jpg',
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
}

export const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test project description',
    labels: ['bug', 'feature'],
    ownerId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: mockUser,
    members: [
        {
            id: 'member-1',
            projectId: 'project-1',
            userId: 'user-1',
            role: 'owner' as const,
            joinedAt: new Date(),
            user: mockUser,
        },
    ],
    columns: [],
    _count: {
        members: 1,
        columns: 0,
    },
}

export const mockColumn = {
    id: 'column-1',
    name: 'To Do',
    order: 0,
    projectId: 'project-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    tasks: [],
    _count: {
        tasks: 0,
    },
}

export const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test task description',
    priority: 'medium' as const,
    labels: ['bug'],
    order: 0,
    columnId: 'column-1',
    creatorId: 'user-1',
    assigneeId: null,
    projectId: 'project-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: mockUser,
    assignee: null,
    column: mockColumn,
    _count: {
        comments: 0,
    },
}

// Custom render with providers
export function renderWithProviders(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }

    return render(ui, { wrapper: Wrapper, ...options })
}

// Mock Next.js router
export const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
}

// Mock form data
export const mockFormData = {
    login: {
        email: 'test@example.com',
        password: 'password123',
    },
    register: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
    },
    createProject: {
        name: 'Test Project',
        description: 'Test project description',
    },
    createTask: {
        title: 'Test Task',
        description: 'Test task description',
        priority: 'medium' as const,
        labels: ['bug'],
        columnId: 'column-1',
        assigneeId: null,
    },
    createColumn: {
        name: 'To Do',
    },
}

// Wait for async operations
export const waitFor = async (callback: () => void, timeout = 1000) => {
    const startTime = Date.now()
    while (Date.now() - startTime < timeout) {
        try {
            callback()
            return
        } catch {
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
    }
    callback()
}

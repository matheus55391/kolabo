export type User = {
    id: string;
    name: string;
    email: string;
    image: string | null;
};

export type ProjectMember = {
    id: string;
    role: string;
    userId: string;
    user: User;
};

export type Column = {
    id: string;
    name: string;
    order: number;
};

export type ColumnWithTasks = Column & {
    tasks: Task[];
};

export type Task = {
    id: string;
    title: string;
    description: string | null;
    priority: string;
    labels: string[];
    order: number;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
    columnId: string;
    creatorId: string;
    assigneeId: string | null;
    creator: User;
    assignee: User | null;
    _count?: {
        comments: number;
    };
};

export type Project = {
    id: string;
    name: string;
    description: string | null;
    labels: string[];
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
    owner: User;
    members: ProjectMember[];
    columns: ColumnWithTasks[];
};

export type Comment = {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    taskId: string;
    authorId: string;
    author: User;
};

export type ActivityLog = {
    id: string;
    action: string;
    field: string | null;
    oldValue: string | null;
    newValue: string | null;
    description: string;
    createdAt: Date;
    taskId: string;
    userId: string;
    user: User;
};

export type Priority = "low" | "medium" | "high" | "urgent";

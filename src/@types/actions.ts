export type ActionResponse<T = unknown> = {
    success: boolean;
    error?: string;
    data?: T;
};

export type LoginFormState = {
    success?: boolean;
    error?: string;
};

export type RegisterFormState = {
    success?: boolean;
    error?: string;
};

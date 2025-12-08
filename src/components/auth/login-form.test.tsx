import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './login-form'
import { authClient } from '@/lib/auth-client'

// Mock do auth client
vi.mock('@/lib/auth-client', () => ({
    authClient: {
        signIn: {
            email: vi.fn(),
        },
    },
}))

// Mock do toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

// Mock do router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        prefetch: vi.fn(),
    }),
}))

// Helpers para criar contextos mock
const createMockRequestContext = () => ({
    url: 'http://localhost:3000',
    headers: new Headers(),
    body: {},
    method: 'POST',
    signal: new AbortController().signal,
})

const createMockSuccessContext = () => ({
    data: {},
    response: new Response(),
    request: createMockRequestContext(),
})

const createMockErrorContext = (message: string) => ({
    error: {
        status: 400,
        statusText: 'Bad Request',
        message,
        name: 'BetterFetchError',
        error: new Error(message),
    },
    response: new Response(null, { status: 400 }),
    request: createMockRequestContext(),
})

describe('LoginForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Renderização', () => {
        it('should render all form fields', () => {
            render(<LoginForm />)

            expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
        })

        it('should render password toggle button', () => {
            render(<LoginForm />)

            const toggleButton = screen.getByRole('button', { name: /mostrar senha/i })
            expect(toggleButton).toBeInTheDocument()
        })

        it('should have email input with correct attributes', () => {
            render(<LoginForm />)

            const emailInput = screen.getByLabelText(/e-mail/i)
            expect(emailInput).toHaveAttribute('type', 'email')
            expect(emailInput).toHaveAttribute('placeholder', 'seu@email.com')
        })

        it('should have password input with correct attributes', () => {
            render(<LoginForm />)

            const passwordInput = screen.getByLabelText(/senha/i)
            expect(passwordInput).toHaveAttribute('type', 'password')
            expect(passwordInput).toHaveAttribute('placeholder', '••••••••')
        })
    })

    describe('Interações do Usuário', () => {
        it('should toggle password visibility', async () => {
            const user = userEvent.setup()
            render(<LoginForm />)

            const passwordInput = screen.getByLabelText(/senha/i)
            const toggleButton = screen.getByRole('button', { name: /mostrar senha/i })

            expect(passwordInput).toHaveAttribute('type', 'password')

            await user.click(toggleButton)
            expect(passwordInput).toHaveAttribute('type', 'text')

            await user.click(toggleButton)
            expect(passwordInput).toHaveAttribute('type', 'password')
        })

        it('should allow typing in email input', async () => {
            const user = userEvent.setup()
            render(<LoginForm />)

            const emailInput = screen.getByLabelText(/e-mail/i)
            await user.type(emailInput, 'test@example.com')

            expect(emailInput).toHaveValue('test@example.com')
        })

        it('should allow typing in password input', async () => {
            const user = userEvent.setup()
            render(<LoginForm />)

            const passwordInput = screen.getByLabelText(/senha/i)
            await user.type(passwordInput, 'password123')

            expect(passwordInput).toHaveValue('password123')
        })
    })

    describe('Validação de Formulário', () => {
        it('should show error for empty password', async () => {
            const user = userEvent.setup()
            render(<LoginForm />)

            const emailInput = screen.getByLabelText(/e-mail/i)
            const submitButton = screen.getByRole('button', { name: /entrar/i })

            await user.type(emailInput, 'test@example.com')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument()
            })
        })

        it('should show error for password less than 8 characters', async () => {
            const user = userEvent.setup()
            render(<LoginForm />)

            const emailInput = screen.getByLabelText(/e-mail/i)
            const passwordInput = screen.getByLabelText(/senha/i)
            const submitButton = screen.getByRole('button', { name: /entrar/i })

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, '1234567')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText(/pelo menos 8 caracteres/i)).toBeInTheDocument()
            })
        })
    })

    describe('Submissão de Formulário', () => {
        it('should submit form with valid data', async () => {
            const user = userEvent.setup()
            const mockSignIn = vi.fn()
            vi.mocked(authClient.signIn.email).mockImplementation(mockSignIn)

            render(<LoginForm />)

            const emailInput = screen.getByLabelText(/e-mail/i)
            const passwordInput = screen.getByLabelText(/senha/i)
            const submitButton = screen.getByRole('button', { name: /entrar/i })

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(mockSignIn).toHaveBeenCalledWith(
                    expect.objectContaining({
                        email: 'test@example.com',
                        password: 'password123',
                        callbackURL: '/dashboard',
                    }),
                    expect.any(Object)
                )
            })
        })

        it('should disable form during submission', async () => {
            const user = userEvent.setup()
            let resolveSignIn: () => void
            const signInPromise = new Promise<void>((resolve) => {
                resolveSignIn = resolve
            })

            vi.mocked(authClient.signIn.email).mockImplementation(
                async (_data, callbacks) => {
                    callbacks?.onRequest?.(createMockRequestContext())
                    await signInPromise
                    callbacks?.onSuccess?.(createMockSuccessContext())
                }
            )

            render(<LoginForm />)

            const emailInput = screen.getByLabelText(/e-mail/i)
            const passwordInput = screen.getByLabelText(/senha/i)
            const submitButton = screen.getByRole('button', { name: /entrar/i })

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(emailInput).toBeDisabled()
                expect(passwordInput).toBeDisabled()
                expect(submitButton).toBeDisabled()
            })

            // Resolve the promise to complete the async operation
            resolveSignIn!()

            // Aguardar atualizações de estado completarem
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/dashboard')
            })
        })

        it('should show success toast and redirect on successful login', async () => {
            const user = userEvent.setup()
            const { toast } = await import('sonner')

            vi.mocked(authClient.signIn.email).mockImplementation(
                async (_data, callbacks) => {
                    callbacks?.onSuccess?.(createMockSuccessContext())
                }
            )

            render(<LoginForm />)

            const emailInput = screen.getByLabelText(/e-mail/i)
            const passwordInput = screen.getByLabelText(/senha/i)
            const submitButton = screen.getByRole('button', { name: /entrar/i })

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith(
                    'Bem-vindo de volta!',
                    expect.objectContaining({
                        description: 'Login realizado com sucesso',
                    })
                )
                expect(mockPush).toHaveBeenCalledWith('/dashboard')
            })
        })

        it('should show error toast on failed login', async () => {
            const user = userEvent.setup()
            const { toast } = await import('sonner')

            vi.mocked(authClient.signIn.email).mockImplementation(
                async (_data, callbacks) => {
                    callbacks?.onError?.(createMockErrorContext('Invalid credentials'))
                }
            )

            render(<LoginForm />)

            const emailInput = screen.getByLabelText(/e-mail/i)
            const passwordInput = screen.getByLabelText(/senha/i)
            const submitButton = screen.getByRole('button', { name: /entrar/i })

            await user.type(emailInput, 'test@example.com')
            await user.type(passwordInput, 'wrongpassword')
            await user.click(submitButton)

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'E-mail ou senha incorretos',
                    expect.objectContaining({
                        description: 'Verifique suas credenciais',
                    })
                )
            })
        })

        it('should show specific error for user not found', async () => {
            const user = userEvent.setup()
            const { toast } = await import('sonner')

            vi.mocked(authClient.signIn.email).mockImplementation(
                async (_data, callbacks) => {
                    callbacks?.onError?.(createMockErrorContext('User not found'))
                }
            )

            render(<LoginForm />)

            const emailInput = screen.getByLabelText(/e-mail/i)
            const passwordInput = screen.getByLabelText(/senha/i)
            const submitButton = screen.getByRole('button', { name: /entrar/i })

            await user.type(emailInput, 'notfound@example.com')
            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Usuário não encontrado',
                    expect.objectContaining({
                        description: 'Verifique seu e-mail ou cadastre-se',
                    })
                )
            })
        })
    })

    describe('Acessibilidade', () => {
        it('should have proper labels for all inputs', () => {
            render(<LoginForm />)

            expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
        })

        it('should have error messages with role="alert"', async () => {
            const user = userEvent.setup()
            render(<LoginForm />)

            const submitButton = screen.getByRole('button', { name: /entrar/i })
            await user.click(submitButton)

            await waitFor(() => {
                const alerts = screen.getAllByRole('alert')
                expect(alerts.length).toBeGreaterThan(0)
            })
        })

        it('should have screen reader text for password toggle', () => {
            render(<LoginForm />)

            const srText = screen.getByText(/mostrar senha/i)
            expect(srText).toBeInTheDocument()
        })
    })
})

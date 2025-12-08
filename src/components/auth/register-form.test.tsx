import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from './register-form'
import { authClient } from '@/lib/auth-client'

// Mock do auth client
vi.mock('@/lib/auth-client', () => ({
    authClient: {
        signUp: {
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

describe('RegisterForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Renderização', () => {
        it('should render all form fields', () => {
            render(<RegisterForm />)

            expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/^e-mail$/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument()
        })

        it('should render password toggle buttons', () => {
            render(<RegisterForm />)

            const toggleButtons = screen.getAllByRole('button', { name: /mostrar senha/i })
            expect(toggleButtons).toHaveLength(2) // One for password, one for confirmPassword
        })

        it('should show password requirements hint', () => {
            render(<RegisterForm />)

            expect(screen.getByText(/mínimo de 8 caracteres/i)).toBeInTheDocument()
        })

        it('should have all inputs with correct attributes', () => {
            render(<RegisterForm />)

            const nameInput = screen.getByLabelText(/nome completo/i)
            expect(nameInput).toHaveAttribute('type', 'text')
            expect(nameInput).toHaveAttribute('placeholder', 'Seu nome')

            const emailInput = screen.getByLabelText(/^e-mail$/i)
            expect(emailInput).toHaveAttribute('type', 'email')
            expect(emailInput).toHaveAttribute('placeholder', 'seu@email.com')

            const passwordInput = screen.getByLabelText(/^senha$/i)
            expect(passwordInput).toHaveAttribute('type', 'password')

            const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
            expect(confirmPasswordInput).toHaveAttribute('type', 'password')
        })
    })

    describe('Interações do Usuário', () => {
        it('should toggle password visibility for both password fields', async () => {
            const user = userEvent.setup()
            render(<RegisterForm />)

            const passwordInput = screen.getByLabelText(/^senha$/i)
            const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
            const toggleButtons = screen.getAllByRole('button', { name: /mostrar senha/i })

            expect(passwordInput).toHaveAttribute('type', 'password')
            expect(confirmPasswordInput).toHaveAttribute('type', 'password')

            // Toggle first password field
            await user.click(toggleButtons[0])
            expect(passwordInput).toHaveAttribute('type', 'text')

            // Toggle second password field
            await user.click(toggleButtons[1])
            expect(confirmPasswordInput).toHaveAttribute('type', 'text')

            // Toggle back
            await user.click(toggleButtons[0])
            expect(passwordInput).toHaveAttribute('type', 'password')

            await user.click(toggleButtons[1])
            expect(confirmPasswordInput).toHaveAttribute('type', 'password')
        })

        it('should allow typing in all inputs', async () => {
            const user = userEvent.setup()
            render(<RegisterForm />)

            const nameInput = screen.getByLabelText(/nome completo/i)
            const emailInput = screen.getByLabelText(/^e-mail$/i)
            const passwordInput = screen.getByLabelText(/^senha$/i)
            const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)

            await user.type(nameInput, 'John Doe')
            await user.type(emailInput, 'john@example.com')
            await user.type(passwordInput, 'password123')
            await user.type(confirmPasswordInput, 'password123')

            expect(nameInput).toHaveValue('John Doe')
            expect(emailInput).toHaveValue('john@example.com')
            expect(passwordInput).toHaveValue('password123')
            expect(confirmPasswordInput).toHaveValue('password123')
        })
    })

    describe('Validação de Formulário', () => {
        it('should show error for name less than 3 characters', async () => {
            const user = userEvent.setup()
            render(<RegisterForm />)

            const nameInput = screen.getByLabelText(/nome completo/i)
            const submitButton = screen.getByRole('button', { name: /criar conta/i })

            await user.type(nameInput, 'AB')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText(/pelo menos 3 caracteres/i)).toBeInTheDocument()
            })
        })

        it('should show error for password less than 8 characters', async () => {
            const user = userEvent.setup()
            render(<RegisterForm />)

            const nameInput = screen.getByLabelText(/nome completo/i)
            const emailInput = screen.getByLabelText(/^e-mail$/i)
            const passwordInput = screen.getByLabelText(/^senha$/i)
            const submitButton = screen.getByRole('button', { name: /criar conta/i })

            await user.type(nameInput, 'John Doe')
            await user.type(emailInput, 'john@example.com')
            await user.type(passwordInput, '1234567')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText(/pelo menos 8 caracteres/i)).toBeInTheDocument()
            })
        })

        it('should show error when passwords do not match', async () => {
            const user = userEvent.setup()
            render(<RegisterForm />)

            const nameInput = screen.getByLabelText(/nome completo/i)
            const emailInput = screen.getByLabelText(/^e-mail$/i)
            const passwordInput = screen.getByLabelText(/^senha$/i)
            const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
            const submitButton = screen.getByRole('button', { name: /criar conta/i })

            await user.type(nameInput, 'John Doe')
            await user.type(emailInput, 'john@example.com')
            await user.type(passwordInput, 'password123')
            await user.type(confirmPasswordInput, 'different123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument()
            })
        })

        it('should show error for missing confirmPassword', async () => {
            const user = userEvent.setup()
            render(<RegisterForm />)

            const nameInput = screen.getByLabelText(/nome completo/i)
            const emailInput = screen.getByLabelText(/^e-mail$/i)
            const passwordInput = screen.getByLabelText(/^senha$/i)
            const submitButton = screen.getByRole('button', { name: /criar conta/i })

            await user.type(nameInput, 'John Doe')
            await user.type(emailInput, 'john@example.com')
            await user.type(passwordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText(/confirmação de senha é obrigatória/i)).toBeInTheDocument()
            })
        })
    })

    describe('Submissão de Formulário', () => {
        it('should submit form with valid data', async () => {
            const user = userEvent.setup()
            const mockSignUp = vi.fn()
            vi.mocked(authClient.signUp.email).mockImplementation(mockSignUp)

            render(<RegisterForm />)

            const nameInput = screen.getByLabelText(/nome completo/i)
            const emailInput = screen.getByLabelText(/^e-mail$/i)
            const passwordInput = screen.getByLabelText(/^senha$/i)
            const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
            const submitButton = screen.getByRole('button', { name: /criar conta/i })

            await user.type(nameInput, 'John Doe')
            await user.type(emailInput, 'john@example.com')
            await user.type(passwordInput, 'password123')
            await user.type(confirmPasswordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(mockSignUp).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'John Doe',
                        email: 'john@example.com',
                        password: 'password123',
                        callbackURL: '/dashboard',
                    }),
                    expect.any(Object)
                )
            })
        })

        it('should disable form during submission', async () => {
            const user = userEvent.setup()
            let resolveSignUp: () => void
            const signUpPromise = new Promise<void>((resolve) => {
                resolveSignUp = resolve
            })

            vi.mocked(authClient.signUp.email).mockImplementation(
                async (_data, callbacks) => {
                    callbacks?.onRequest?.(createMockRequestContext())
                    await signUpPromise
                    callbacks?.onSuccess?.(createMockSuccessContext())
                }
            )

            render(<RegisterForm />)

            const nameInput = screen.getByLabelText(/nome completo/i)
            const emailInput = screen.getByLabelText(/^e-mail$/i)
            const passwordInput = screen.getByLabelText(/^senha$/i)
            const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
            const submitButton = screen.getByRole('button', { name: /criar conta/i })

            await user.type(nameInput, 'John Doe')
            await user.type(emailInput, 'john@example.com')
            await user.type(passwordInput, 'password123')
            await user.type(confirmPasswordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(nameInput).toBeDisabled()
                expect(emailInput).toBeDisabled()
                expect(passwordInput).toBeDisabled()
                expect(confirmPasswordInput).toBeDisabled()
                expect(submitButton).toBeDisabled()
            })

            // Resolve the promise to complete the async operation
            resolveSignUp!()

            // Aguardar atualizações de estado completarem
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/dashboard')
            })
        })

        it('should show success toast and redirect on successful registration', async () => {
            const user = userEvent.setup()
            const { toast } = await import('sonner')

            vi.mocked(authClient.signUp.email).mockImplementation(
                async (_data, callbacks) => {
                    callbacks?.onSuccess?.(createMockSuccessContext())
                }
            )

            render(<RegisterForm />)

            const nameInput = screen.getByLabelText(/nome completo/i)
            const emailInput = screen.getByLabelText(/^e-mail$/i)
            const passwordInput = screen.getByLabelText(/^senha$/i)
            const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
            const submitButton = screen.getByRole('button', { name: /criar conta/i })

            await user.type(nameInput, 'John Doe')
            await user.type(emailInput, 'john@example.com')
            await user.type(passwordInput, 'password123')
            await user.type(confirmPasswordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith(
                    'Bem-vindo ao Kolabo! 🎉',
                    expect.objectContaining({
                        description: 'Sua conta foi criada com sucesso',
                    })
                )
                expect(mockPush).toHaveBeenCalledWith('/dashboard')
            })
        })

        it('should show error toast when email already exists', async () => {
            const user = userEvent.setup()
            const { toast } = await import('sonner')

            vi.mocked(authClient.signUp.email).mockImplementation(
                async (_data, callbacks) => {
                    callbacks?.onError?.(createMockErrorContext('Email already exists'))
                }
            )

            render(<RegisterForm />)

            const nameInput = screen.getByLabelText(/nome completo/i)
            const emailInput = screen.getByLabelText(/^e-mail$/i)
            const passwordInput = screen.getByLabelText(/^senha$/i)
            const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
            const submitButton = screen.getByRole('button', { name: /criar conta/i })

            await user.type(nameInput, 'John Doe')
            await user.type(emailInput, 'existing@example.com')
            await user.type(passwordInput, 'password123')
            await user.type(confirmPasswordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'E-mail já cadastrado',
                    expect.objectContaining({
                        description: expect.stringContaining('já está sendo usado'),
                    })
                )
            })
        })

        it('should show generic error toast on other errors', async () => {
            const user = userEvent.setup()
            const { toast } = await import('sonner')

            vi.mocked(authClient.signUp.email).mockImplementation(
                async (_data, callbacks) => {
                    callbacks?.onError?.(createMockErrorContext('Something went wrong'))
                }
            )

            render(<RegisterForm />)

            const nameInput = screen.getByLabelText(/nome completo/i)
            const emailInput = screen.getByLabelText(/^e-mail$/i)
            const passwordInput = screen.getByLabelText(/^senha$/i)
            const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)
            const submitButton = screen.getByRole('button', { name: /criar conta/i })

            await user.type(nameInput, 'John Doe')
            await user.type(emailInput, 'john@example.com')
            await user.type(passwordInput, 'password123')
            await user.type(confirmPasswordInput, 'password123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Erro ao criar conta',
                    expect.objectContaining({
                        description: 'Tente novamente mais tarde',
                    })
                )
            })
        })
    })

    describe('Acessibilidade', () => {
        it('should have proper labels for all inputs', () => {
            render(<RegisterForm />)

            expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/^e-mail$/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument()
        })

        it('should have error messages with role="alert"', async () => {
            const user = userEvent.setup()
            render(<RegisterForm />)

            const submitButton = screen.getByRole('button', { name: /criar conta/i })
            await user.click(submitButton)

            await waitFor(() => {
                const alerts = screen.getAllByRole('alert')
                expect(alerts.length).toBeGreaterThan(0)
            })
        })

        it('should have screen reader text for password toggles', () => {
            render(<RegisterForm />)

            const srTexts = screen.getAllByText(/mostrar senha/i)
            expect(srTexts.length).toBeGreaterThan(0)
        })

        it('should have helper text for password requirements', () => {
            render(<RegisterForm />)

            const helperText = screen.getByText(/mínimo de 8 caracteres/i)
            expect(helperText).toHaveClass('text-xs', 'text-muted-foreground')
        })
    })

    describe('Fluxo Completo de Registro', () => {
        it('should complete full registration flow successfully', async () => {
            const user = userEvent.setup()
            const { toast } = await import('sonner')

            vi.mocked(authClient.signUp.email).mockImplementation(
                async (_data, callbacks) => {
                    callbacks?.onRequest?.(createMockRequestContext())
                    await new Promise((resolve) => setTimeout(resolve, 100))
                    callbacks?.onSuccess?.(createMockSuccessContext())
                }
            )

            render(<RegisterForm />)

            // Preencher todos os campos
            await user.type(screen.getByLabelText(/nome completo/i), 'John Doe')
            await user.type(screen.getByLabelText(/^e-mail$/i), 'john@example.com')
            await user.type(screen.getByLabelText(/^senha$/i), 'SecurePass123')
            await user.type(screen.getByLabelText(/confirmar senha/i), 'SecurePass123')

            // Submeter formulário
            await user.click(screen.getByRole('button', { name: /criar conta/i }))

            // Verificar loading state
            await waitFor(() => {
                expect(screen.getByLabelText(/nome completo/i)).toBeDisabled()
            })

            // Verificar sucesso
            await waitFor(() => {
                expect(toast.success).toHaveBeenCalled()
                expect(mockPush).toHaveBeenCalledWith('/dashboard')
            })
        })
    })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logoutAction } from './actions'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

// Mock do auth
vi.mock('@/lib/auth', () => ({
    auth: {
        api: {
            signOut: vi.fn(),
        },
    },
}))

// Mock do next/headers
vi.mock('next/headers', () => ({
    headers: vi.fn(),
}))

// Mock do next/navigation
vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}))

describe('logoutAction', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Execução', () => {
        it('should call signOut with headers', async () => {
            const mockHeaders = new Headers()
            vi.mocked(headers).mockResolvedValue(mockHeaders)
            vi.mocked(auth.api.signOut).mockResolvedValue({ success: true })

            await logoutAction()

            expect(auth.api.signOut).toHaveBeenCalledWith({
                headers: mockHeaders,
            })
        })

        it('should redirect to login page after sign out', async () => {
            vi.mocked(headers).mockResolvedValue(new Headers())
            vi.mocked(auth.api.signOut).mockResolvedValue({ success: true })

            await logoutAction()

            expect(redirect).toHaveBeenCalledWith('/login')
        })

        it('should call signOut before redirect', async () => {
            const callOrder: string[] = []

            vi.mocked(headers).mockResolvedValue(new Headers())
            vi.mocked(auth.api.signOut).mockImplementation(async () => {
                callOrder.push('signOut')
                return { success: true }
            })
            vi.mocked(redirect).mockImplementation(() => {
                callOrder.push('redirect')
                throw new Error('NEXT_REDIRECT') // Next.js redirect throws
            })

            try {
                await logoutAction()
            } catch (error) {
                // Redirect throws, which is expected
            }

            expect(callOrder).toEqual(['signOut', 'redirect'])
        })
    })

    describe('Tratamento de Erros', () => {
        it('should handle signOut errors', async () => {
            vi.mocked(headers).mockResolvedValue(new Headers())
            vi.mocked(auth.api.signOut).mockRejectedValue(new Error('Sign out failed'))

            await expect(logoutAction()).rejects.toThrow('Sign out failed')
        })

        it('should handle headers error', async () => {
            vi.mocked(headers).mockRejectedValue(new Error('Headers failed'))

            await expect(logoutAction()).rejects.toThrow('Headers failed')
        })
    })

    describe('Integração', () => {
        it('should complete full logout flow', async () => {
            const mockHeaders = new Headers()
            mockHeaders.set('cookie', 'session=abc123')

            vi.mocked(headers).mockResolvedValue(mockHeaders)
            vi.mocked(auth.api.signOut).mockResolvedValue({ success: true })
            // Reset redirect mock para não lançar erro neste teste
            vi.mocked(redirect).mockReturnValue(undefined as never)

            await logoutAction()

            expect(auth.api.signOut).toHaveBeenCalledTimes(1)
            expect(auth.api.signOut).toHaveBeenCalledWith({
                headers: mockHeaders,
            })
            expect(redirect).toHaveBeenCalledWith('/login')
        })
    })
})

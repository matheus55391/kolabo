import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from './auth-schema'

describe('auth-schema', () => {
    describe('loginSchema', () => {
        it('should validate correct login data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123',
            }

            const result = loginSchema.safeParse(validData)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual(validData)
            }
        })

        it('should reject invalid email', () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'password123',
            }

            const result = loginSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject empty email', () => {
            const invalidData = {
                email: '',
                password: 'password123',
            }

            const result = loginSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject empty password', () => {
            const invalidData = {
                email: 'test@example.com',
                password: '',
            }

            const result = loginSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject missing fields', () => {
            const invalidData = {}

            const result = loginSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })
    })

    describe('registerSchema', () => {
        it('should validate correct registration data', () => {
            const validData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            }

            const result = registerSchema.safeParse(validData)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual(validData)
            }
        })

        it('should reject name less than 3 characters', () => {
            const invalidData = {
                name: 'AB',
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            }

            const result = registerSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject invalid email format', () => {
            const invalidData = {
                name: 'Test User',
                email: 'invalid-email',
                password: 'password123',
                confirmPassword: 'password123',
            }

            const result = registerSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject password less than 8 characters', () => {
            const invalidData = {
                name: 'Test User',
                email: 'test@example.com',
                password: '1234567',
                confirmPassword: '1234567',
            }

            const result = registerSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject when passwords do not match', () => {
            const invalidData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'different123',
            }

            const result = registerSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('não coincidem')
            }
        })

        it('should reject empty name', () => {
            const invalidData = {
                name: '',
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            }

            const result = registerSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject missing confirmPassword', () => {
            const invalidData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            }

            const result = registerSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject missing fields', () => {
            const invalidData = {
                name: 'Test User',
            }

            const result = registerSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })
    })
})

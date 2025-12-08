import { describe, it, expect } from 'vitest'
import {
    createProjectSchema,
    createTaskSchema,
    updateTaskSchema,
    createColumnSchema,
    updateColumnSchema,
} from './project-schema'

describe('project-schema', () => {
    describe('createProjectSchema', () => {
        it('should validate correct project data', () => {
            const validData = {
                name: 'Test Project',
            }

            const result = createProjectSchema.safeParse(validData)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual(validData)
            }
        })

        it('should reject name less than 3 characters', () => {
            const invalidData = {
                name: 'AB',
            }

            const result = createProjectSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('pelo menos 3 caracteres')
            }
        })

        it('should reject name more than 50 characters', () => {
            const invalidData = {
                name: 'A'.repeat(51),
            }

            const result = createProjectSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('no máximo 50 caracteres')
            }
        })

        it('should reject empty name', () => {
            const invalidData = {
                name: '',
            }

            const result = createProjectSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })
    })

    describe('createTaskSchema', () => {
        it('should validate correct task data with all fields', () => {
            const validData = {
                title: 'Test Task',
                description: 'Test description',
                priority: 'high' as const,
                labels: ['bug', 'feature'],
                columnId: 'column-1',
                assigneeId: 'user-1',
            }

            const result = createTaskSchema.safeParse(validData)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual(validData)
            }
        })

        it('should validate with only required fields', () => {
            const validData = {
                title: 'Test Task',
                columnId: 'column-1',
            }

            const result = createTaskSchema.safeParse(validData)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.priority).toBe('medium') // default
                expect(result.data.labels).toEqual([]) // default
            }
        })

        it('should reject empty title', () => {
            const invalidData = {
                title: '',
                columnId: 'column-1',
            }

            const result = createTaskSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('obrigatório')
            }
        })

        it('should reject title longer than 200 characters', () => {
            const invalidData = {
                title: 'A'.repeat(201),
                columnId: 'column-1',
            }

            const result = createTaskSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('muito longo')
            }
        })

        it('should reject invalid priority', () => {
            const invalidData = {
                title: 'Test Task',
                priority: 'invalid',
                columnId: 'column-1',
            }

            const result = createTaskSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should accept all valid priority values', () => {
            const priorities = ['low', 'medium', 'high', 'urgent'] as const

            priorities.forEach((priority) => {
                const validData = {
                    title: 'Test Task',
                    priority,
                    columnId: 'column-1',
                }

                const result = createTaskSchema.safeParse(validData)
                expect(result.success).toBe(true)
            })
        })

        it('should reject empty columnId', () => {
            const invalidData = {
                title: 'Test Task',
                columnId: '',
            }

            const result = createTaskSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('obrigatória')
            }
        })

        it('should accept optional description', () => {
            const validData = {
                title: 'Test Task',
                columnId: 'column-1',
            }

            const result = createTaskSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should accept optional assigneeId', () => {
            const validData = {
                title: 'Test Task',
                columnId: 'column-1',
            }

            const result = createTaskSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })
    })

    describe('updateTaskSchema', () => {
        it('should validate with all fields', () => {
            const validData = {
                title: 'Updated Task',
                description: 'Updated description',
                priority: 'urgent' as const,
                labels: ['updated'],
                columnId: 'column-2',
                assigneeId: 'user-2',
            }

            const result = updateTaskSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should validate with no fields (all optional)', () => {
            const validData = {}

            const result = updateTaskSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should accept null assigneeId', () => {
            const validData = {
                assigneeId: null,
            }

            const result = updateTaskSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should reject empty title if provided', () => {
            const invalidData = {
                title: '',
            }

            const result = updateTaskSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject title longer than 200 characters if provided', () => {
            const invalidData = {
                title: 'A'.repeat(201),
            }

            const result = updateTaskSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should validate partial updates', () => {
            const validData = {
                priority: 'low' as const,
            }

            const result = updateTaskSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })
    })

    describe('createColumnSchema', () => {
        it('should validate correct column data', () => {
            const validData = {
                name: 'To Do',
            }

            const result = createColumnSchema.safeParse(validData)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual(validData)
            }
        })

        it('should reject empty name', () => {
            const invalidData = {
                name: '',
            }

            const result = createColumnSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('obrigatório')
            }
        })

        it('should reject name longer than 50 characters', () => {
            const invalidData = {
                name: 'A'.repeat(51),
            }

            const result = createColumnSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('muito longo')
            }
        })

        it('should accept single character name', () => {
            const validData = {
                name: 'A',
            }

            const result = createColumnSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should accept name with 50 characters (boundary)', () => {
            const validData = {
                name: 'A'.repeat(50),
            }

            const result = createColumnSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })
    })

    describe('updateColumnSchema', () => {
        it('should validate correct column data', () => {
            const validData = {
                name: 'In Progress',
            }

            const result = updateColumnSchema.safeParse(validData)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toEqual(validData)
            }
        })

        it('should reject empty name', () => {
            const invalidData = {
                name: '',
            }

            const result = updateColumnSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('obrigatório')
            }
        })

        it('should reject name longer than 50 characters', () => {
            const invalidData = {
                name: 'A'.repeat(51),
            }

            const result = updateColumnSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('muito longo')
            }
        })
    })
})

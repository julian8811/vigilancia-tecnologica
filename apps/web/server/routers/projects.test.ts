import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Replicate the validation schemas for testing
const createProjectSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  color: z.string().optional(),
})

const listProjectsSchema = z.object({
  workspaceId: z.string().uuid(),
})

describe('projectsRouter validation', () => {
  describe('create validation', () => {
    it('validates valid input', () => {
      const input = {
        workspaceId: 'f47ac10b-58ea-43ec-ae16-09d6ac4a8d09',
        name: 'My Project',
        description: 'A test project',
        color: '#3B82F6',
      }
      const result = createProjectSchema.parse(input)
      expect(result.name).toBe('My Project')
    })

    it('rejects invalid UUID for workspaceId', () => {
      expect(() =>
        createProjectSchema.parse({
          workspaceId: 'not-a-uuid',
          name: 'My Project',
        })
      ).toThrow()
    })

    it('rejects empty name', () => {
      expect(() =>
        createProjectSchema.parse({
          workspaceId: 'f47ac10b-58ea-43ec-ae16-09d6ac4a8d09',
          name: '',
        })
      ).toThrow()
    })

    it('rejects name too long', () => {
      expect(() =>
        createProjectSchema.parse({
          workspaceId: 'f47ac10b-58ea-43ec-ae16-09d6ac4a8d09',
          name: 'a'.repeat(201),
        })
      ).toThrow()
    })

    it('allows optional fields to be omitted', () => {
      const input = {
        workspaceId: 'f47ac10b-58ea-43ec-ae16-09d6ac4a8d09',
        name: 'My Project',
      }
      const result = createProjectSchema.parse(input)
      expect(result.description).toBeUndefined()
      expect(result.color).toBeUndefined()
    })
  })

  describe('list validation', () => {
    it('validates valid UUID', () => {
      const input = {
        workspaceId: 'f47ac10b-58ea-43ec-ae16-09d6ac4a8d09',
      }
      const result = listProjectsSchema.parse(input)
      expect(result.workspaceId).toBeDefined()
    })

    it('rejects invalid UUID', () => {
      expect(() =>
        listProjectsSchema.parse({
          workspaceId: 'invalid',
        })
      ).toThrow()
    })
  })
})
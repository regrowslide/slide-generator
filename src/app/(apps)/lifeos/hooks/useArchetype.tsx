'use client'
import { ArchetypeType } from '../types'
import { getArchetype, hasArchetype } from '../components/archetypes/registry'

export interface UseArchetypeProps {
  data: unknown
  schema?: Record<string, unknown>
  archetype?: ArchetypeType
}

export const useArchetype = ({ archetype }: { archetype: ArchetypeType }) => {
  const inferredArchetype =
    archetype && hasArchetype(archetype) ? archetype : 'attribute-card'




  const Component = getArchetype(inferredArchetype)
  return {
    archetype: inferredArchetype,
    Component,
  }
}


import { GeneratedCharacter } from "./types/character"

const API_BASE_URL = '/api/v1'

interface SavedCharacter {
  id: number
  name: string
  character_class: string
  stats: Record<string, number>
  appearance: string
  description: string
  moves: Array<{
    name: string
    description: string
  }>
  equipment: Array<{
    name: string
    description: string
    isRemovable: boolean
    isWeapon: boolean
    options?: Array<{ name: string; effect: string }>
  }>
  created_at: string
  updated_at: string
}

interface CharactersStats {
  total: number
  this_month: number
}

export async function getSavedCharacters(): Promise<SavedCharacter[]> {
  const response = await fetch(`${API_BASE_URL}/character-gen/saved-characters`)
  if (!response.ok) {
    throw new Error('Failed to fetch saved characters')
  }
  return response.json()
}

export async function getCharacter(id: number): Promise<SavedCharacter> {
  const response = await fetch(`${API_BASE_URL}/character-gen/saved-characters/${id}`)
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Postać nie została znaleziona')
    }
    if (response.status === 403) {
      throw new Error('Nie masz uprawnień do wyświetlenia tej postaci')
    }
    throw new Error('Failed to fetch character')
  }
  return response.json()
}

export async function getCharactersStats(): Promise<CharactersStats> {
  const response = await fetch(`${API_BASE_URL}/character-gen/saved-characters/stats`)
  if (!response.ok) {
    throw new Error('Failed to fetch characters stats')
  }
  return response.json()
}

export async function saveCharacter(character: GeneratedCharacter): Promise<SavedCharacter> {
  const response = await fetch(`${API_BASE_URL}/character-gen/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(character),
  })
  if (!response.ok) {
    throw new Error('Failed to save character')
  }
  return response.json()
}

export const updateCharacter = async (characterId: number, character: GeneratedCharacter): Promise<SavedCharacter> => {
  try {
    const response = await fetch(`${API_BASE_URL}/character-gen/saved-characters/${characterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(character),
    });
    return response.json();
  } catch (error) {
    console.error('Error updating character:', error);
    throw error;
  }
}

export async function getAvailableMoves(characterClass: string): Promise<Array<{ name: string; description: string }>> {
  const response = await fetch(`${API_BASE_URL}/character-gen/moves/${characterClass}`)
  if (!response.ok) {
    throw new Error('Failed to fetch available moves')
  }
  return response.json()
} 
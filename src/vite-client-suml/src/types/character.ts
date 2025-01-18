export interface Move {
  name: string
  description: string
}

export interface Equipment {
  name: string
  description: string
  isRemovable: boolean
  isWeapon: boolean
  options?: Array<{ name: string; effect: string }>
}

export interface Stats {
  cool: number
  hard: number
  hot: number
  sharp: number
  weird: number
}

export interface GeneratedCharacter {
  name: string
  characterClass: string
  stats: Stats
  appearance: string
  description: string
  moves: Move[]
  equipment: Equipment[]
} 
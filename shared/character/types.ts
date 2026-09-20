// Character JSON types. Mirrors docs/contracts.md section 5.1. Change both together (contracts.md section 8).

export type Slot = 'ears' | 'bow' | 'hair' | 'face' | 'outfit' | 'accessory';

/** Part ids (D-44), for example "hair_short". Every slot is always present; "none" is a real part. */
export type CharacterParts = Record<Slot, string>;

/** CSS color values (hex). The four variables of the rig (D-35). */
export interface CharacterColors {
  skin: string;
  hair: string;
  bow: string;
  outfit: string;
}

export interface CharacterOptions {
  glasses: boolean;
  freckles: boolean;
}

/** What the renderer needs to draw a character. */
export interface CharacterLook {
  parts: CharacterParts;
  colors: CharacterColors;
  options: CharacterOptions;
}

/** The stored character (contracts.md section 5.1). */
export interface Character extends CharacterLook {
  id: string;
  ownerId: string;
  name: string;
  personality: string;
  onStage: boolean;
  nameHidden: boolean;
  createdAt: number;
}

/** v1 clips (D-3). The rest are finished in Phase 3. */
export type ClipName = 'idle' | 'walk' | 'wave' | 'dance_a' | 'jump';

// A sample character for the gallery and the display. The JSON is in the Character format of contracts.md 5.1.
import sample from './sample-character.json';
import type { Character, CharacterLook } from './types';

export const sampleCharacter: Character = sample;

export const sampleLook: CharacterLook = {
  parts: sample.parts,
  colors: sample.colors,
  options: sample.options,
};

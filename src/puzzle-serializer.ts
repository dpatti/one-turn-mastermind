import { Code, Color, GuessWithFeedback, PuzzleData, DeserializedPuzzle } from './types.js';
import { calculateFeedback, findAllPossibleSolutions } from './game-logic.js';

// Map colors to values 1-6 (avoiding 0 for easier bit manipulation)
const COLOR_TO_VALUE: Record<Color, number> = {
  R: 1, G: 2, B: 3, Y: 4, O: 5, P: 6
};
const VALUE_TO_COLOR: Color[] = ['', 'R', 'G', 'B', 'Y', 'O', 'P'] as Color[];

export function serializePuzzle(puzzleData: PuzzleData): string {
  console.log('Serializing puzzle:', puzzleData);

  // Pack colors into bits - each color needs 3 bits (values 1-6)
  // A code of 4 colors needs 12 bits total
  const packCode = (code: Code): number => {
    let packed = 0;
    for (let i = 0; i < 4; i++) {
      packed = (packed << 3) | COLOR_TO_VALUE[code[i]];
    }
    return packed;
  };

  // Start with version prefix
  let result = '1.';

  // Add secret
  const secretPacked = packCode(puzzleData.secret);
  result += secretPacked.toString(36).padStart(3, '0');

  // Add each guess
  for (const { guess } of puzzleData.pastGuesses) {
    const guessPacked = packCode(guess);
    result += guessPacked.toString(36).padStart(3, '0');
  }

  console.log('Encoded string:', result);
  return result;
}

export function deserializePuzzle(serialized: string): DeserializedPuzzle | null {
  try {
    console.log('Deserializing puzzle:', serialized);

    // Check version prefix
    if (!serialized.startsWith('1.')) {
      console.error('Unsupported serialization version');
      return null;
    }

    // Remove version prefix
    const data = serialized.slice(2);

    // Unpack a 12-bit packed code back to colors
    const unpackCode = (packed: number): Code => {
      const code: Color[] = [];
      for (let i = 3; i >= 0; i--) {
        const value = (packed >> (i * 3)) & 0x7;
        if (value < 1 || value > 6) return null as any;
        code.push(VALUE_TO_COLOR[value]);
      }
      return code as Code;
    };

    // Each code is encoded as 3 base36 characters
    if (data.length % 3 !== 0 || data.length < 3) return null;

    const values: number[] = [];
    for (let i = 0; i < data.length; i += 3) {
      const chunk = data.slice(i, i + 3);
      const value = parseInt(chunk, 36);
      if (isNaN(value)) return null;
      values.push(value);
    }

    // First value is the secret
    const secret = unpackCode(values[0]);
    if (!secret) return null;

    console.log('Decoded secret:', secret);

    // Remaining values are guesses
    const pastGuesses: GuessWithFeedback[] = [];
    for (let i = 1; i < values.length; i++) {
      const guess = unpackCode(values[i]);
      if (!guess) return null;

      // Calculate feedback from secret and guess
      const feedback = calculateFeedback(guess, secret);

      console.log(`Decoded guess ${i - 1}:`, guess, 'calculated feedback:', feedback);
      pastGuesses.push({ guess, feedback });
    }

    const puzzleData = { secret, pastGuesses };
    console.log('Final deserialized result:', puzzleData);

    // Validate that the puzzle has a unique solution
    const possibleSolutions = findAllPossibleSolutions(pastGuesses);
    let validationWarning: string | undefined;

    // These should never happen since feedback is calculated from the secret
    if (possibleSolutions.length === 0) {
      throw new Error('Assertion failed: No possible solutions found. This should be impossible since feedback is calculated from the secret.');
    }

    if (possibleSolutions.length === 1) {
      const uniqueSolution = possibleSolutions[0];
      const secretMatches = secret.every((color, index) => color === uniqueSolution[index]);
      if (!secretMatches) {
        throw new Error('Assertion failed: Unique solution does not match secret. This should be impossible since feedback is calculated from the secret.');
      }
    }

    // The only real validation issue: ambiguous puzzle with multiple solutions
    if (possibleSolutions.length > 1) {
      console.warn(`Invalid puzzle: ${possibleSolutions.length} possible solutions found, puzzle is ambiguous`);
      console.warn('Possible solutions:', possibleSolutions);
      validationWarning = `The puzzle contained in this URL is ambiguous with ${possibleSolutions.length} possible solutions and cannot be solved uniquely. The URL may have been corrupted.`;
    }

    return { puzzleData, validationWarning };
  } catch (e) {
    console.error('Failed to deserialize puzzle:', e);
    return null;
  }
}

export function getCurrentPuzzleData(secret: Code, pastGuesses: GuessWithFeedback[]): PuzzleData {
  return { secret, pastGuesses };
}

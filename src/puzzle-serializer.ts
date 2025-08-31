import { Code, Color, GuessWithFeedback, PuzzleData } from './types.js';
import { calculateFeedback } from './game-logic.js';

// Map colors to indices for compact encoding
const COLOR_TO_INDEX: Record<Color, number> = {
  R: 0, G: 1, B: 2, Y: 3, O: 4, P: 5
};
const INDEX_TO_COLOR: Color[] = ['R', 'G', 'B', 'Y', 'O', 'P'];

export function serializePuzzle(puzzleData: PuzzleData): string {
  console.log('Serializing puzzle:', puzzleData);
  
  // Encode only secret and guesses - feedback can be recalculated
  let result = '';
  
  // Encode secret (4 characters)
  for (const color of puzzleData.secret) {
    result += COLOR_TO_INDEX[color].toString();
  }
  
  // Encode number of guesses (1 hex digit)
  result += puzzleData.pastGuesses.length.toString(16);
  
  // Encode each guess only (no feedback needed)
  for (const { guess } of puzzleData.pastGuesses) {
    for (const color of guess) {
      result += COLOR_TO_INDEX[color].toString();
    }
  }
  
  console.log('Encoded string:', result);
  
  // Convert to base64 for URL safety
  return btoa(result).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function deserializePuzzle(serialized: string): PuzzleData | null {
  try {
    console.log('Deserializing puzzle:', serialized);
    
    // Restore base64 padding and convert back
    const padded = serialized.replace(/-/g, '+').replace(/_/g, '/');
    const paddedLength = padded + '==='.slice(0, (4 - padded.length % 4) % 4);
    const decoded = atob(paddedLength);
    
    console.log('Decoded string:', decoded);
    
    if (decoded.length < 5) return null; // At least secret (4) + count (1)
    
    let pos = 0;
    
    // Decode secret (4 characters)
    const secret: Code = [
      INDEX_TO_COLOR[parseInt(decoded[pos++])],
      INDEX_TO_COLOR[parseInt(decoded[pos++])],
      INDEX_TO_COLOR[parseInt(decoded[pos++])],
      INDEX_TO_COLOR[parseInt(decoded[pos++])]
    ];
    
    console.log('Decoded secret:', secret);
    
    // Decode number of guesses
    const numGuesses = parseInt(decoded[pos++], 16);
    console.log('Number of guesses:', numGuesses);
    
    if (decoded.length < 5 + numGuesses * 4) return null; // Each guess is 4 chars (4 colors)
    
    // Decode guesses and calculate feedback
    const pastGuesses: GuessWithFeedback[] = [];
    for (let i = 0; i < numGuesses; i++) {
      const guess: Code = [
        INDEX_TO_COLOR[parseInt(decoded[pos++])],
        INDEX_TO_COLOR[parseInt(decoded[pos++])],
        INDEX_TO_COLOR[parseInt(decoded[pos++])],
        INDEX_TO_COLOR[parseInt(decoded[pos++])]
      ];
      
      // Calculate feedback from secret and guess
      const feedback = calculateFeedback(guess, secret);
      
      console.log(`Decoded guess ${i}:`, guess, 'calculated feedback:', feedback);
      pastGuesses.push({ guess, feedback });
    }
    
    const result = { secret, pastGuesses };
    console.log('Final deserialized result:', result);
    return result;
  } catch (e) {
    console.error('Failed to deserialize puzzle:', e);
    return null;
  }
}

export function getCurrentPuzzleData(secret: Code, pastGuesses: GuessWithFeedback[]): PuzzleData {
  return { secret, pastGuesses };
}
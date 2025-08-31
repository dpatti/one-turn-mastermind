import { Color, Code, Feedback, GuessWithFeedback, COLORS } from './types.js';

export function generateRandomGuesses(): GuessWithFeedback[] {
  const guesses: GuessWithFeedback[] = [];
  const numGuesses = 3 + Math.floor(Math.random() * 3);

  for (let i = 0; i < numGuesses; i++) {
    const guess: Code = [
      COLORS[Math.floor(Math.random() * COLORS.length)],
      COLORS[Math.floor(Math.random() * COLORS.length)],
      COLORS[Math.floor(Math.random() * COLORS.length)],
      COLORS[Math.floor(Math.random() * COLORS.length)]
    ];

    const feedback: Feedback = {
      black: Math.floor(Math.random() * 3),
      white: Math.floor(Math.random() * (5 - Math.floor(Math.random() * 3)))
    };

    guesses.push({ guess, feedback });
  }

  return guesses;
}

export function generateOptimalGuesses(secret: Code): GuessWithFeedback[] {
  let remainingPossibilities = generateAllPossibleGuesses();
  
  const selectedGuesses: GuessWithFeedback[] = [];
  
  console.log({ secret, initialPossibilities: remainingPossibilities.length });
  
  // First guess is completely random for variety
  if (remainingPossibilities.length > 1) {
    const nonSecretPossibilities = remainingPossibilities.filter(guess => !arraysEqual(guess, secret));
    const randomIndex = Math.floor(Math.random() * nonSecretPossibilities.length);
    const firstGuess = nonSecretPossibilities[randomIndex];
    
    const feedback = calculateFeedback(firstGuess, secret);
    selectedGuesses.push({ guess: firstGuess, feedback });
    const newRemaining = filterPossibleSolutions(remainingPossibilities, firstGuess, feedback);
    
    console.log({ 
      guessNumber: 1, 
      type: 'random', 
      guess: firstGuess, 
      feedback, 
      eliminated: remainingPossibilities.length - newRemaining.length,
      remaining: newRemaining.length 
    });
    
    remainingPossibilities = newRemaining;
  }
  
  // Continue with optimal guesses until only the secret remains
  while (remainingPossibilities.length > 1) {
    console.log({ beforeGuess: selectedGuesses.length + 1, remainingPossibilities });
    
    const bestGuess = findBestGuess(remainingPossibilities, secret);
    const feedback = calculateFeedback(bestGuess, secret);
    selectedGuesses.push({ guess: bestGuess, feedback });
    
    const newRemaining = filterPossibleSolutions(remainingPossibilities, bestGuess, feedback);
    console.log({ 
      guessNumber: selectedGuesses.length, 
      type: 'optimal', 
      guess: bestGuess, 
      feedback, 
      eliminated: remainingPossibilities.length - newRemaining.length,
      remaining: newRemaining.length 
    });
    
    remainingPossibilities = newRemaining;
    
    // Safety check to avoid infinite loops
    if (selectedGuesses.length > 10) {
      console.warn({ error: 'Too many guesses generated, stopping' });
      break;
    }
  }
  
  // Verify that the generated clues lead to a unique solution
  const allSolutions = findAllPossibleSolutions(selectedGuesses);
  if (allSolutions.length !== 1 || !arraysEqual(allSolutions[0], secret)) {
    console.warn({ 
      error: 'Generated puzzle does not have unique solution', 
      solutionCount: allSolutions.length,
      solutions: allSolutions,
      expected: secret,
      guesses: selectedGuesses 
    });
  } else {
    console.log({ 
      success: true, 
      totalGuesses: selectedGuesses.length, 
      solution: secret,
      finalRemainingPossibilities: remainingPossibilities.length
    });
  }
  
  return selectedGuesses;
}

function findBestGuess(remainingPossibilities: Code[], secret: Code): Code {
  const allPossibleGuesses = generateAllPossibleGuesses();
  let bestGuess: Code | null = null;
  let bestScore = -1;
  let countWithBestScore = 0;
  
  for (const guess of allPossibleGuesses) {
    // Skip the secret itself
    if (arraysEqual(guess, secret)) {
      continue;
    }
    
    const score = calculateGuessScore(guess, remainingPossibilities);
    
    if (score > bestScore) {
      bestScore = score;
      bestGuess = guess;
      countWithBestScore = 1;
    } else if (score === bestScore) {
      countWithBestScore++;
      if (Math.random() < 1 / countWithBestScore) {
        bestGuess = guess;
      }
    }
  }
  
  // Fallback: if somehow no guess was found (shouldn't happen), return first non-secret
  return bestGuess || remainingPossibilities.find(g => !arraysEqual(g, secret))!;
}

function calculateGuessScore(guess: Code, remainingPossibilities: Code[]): number {
  // Group remaining possibilities by the feedback they would give for this guess
  const feedbackGroups = new Map<string, number>();
  
  for (const possibility of remainingPossibilities) {
    const feedback = calculateFeedback(guess, possibility);
    const feedbackKey = `${feedback.black}-${feedback.white}`;
    feedbackGroups.set(feedbackKey, (feedbackGroups.get(feedbackKey) || 0) + 1);
  }
  
  // Find the largest group (worst case scenario)
  let largestGroup = 0;
  for (const groupSize of feedbackGroups.values()) {
    if (groupSize > largestGroup) {
      largestGroup = groupSize;
    }
  }
  
  // Return minimum guaranteed eliminations (worst case)
  return remainingPossibilities.length - largestGroup;
}

function arraysEqual(a: Code, b: Code): boolean {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

export function findAllPossibleSolutions(guessesWithFeedback: GuessWithFeedback[]): Code[] {
  let possibleSolutions = generateAllPossibleGuesses();
  
  for (const { guess, feedback } of guessesWithFeedback) {
    possibleSolutions = filterPossibleSolutions(possibleSolutions, guess, feedback);
  }
  
  return possibleSolutions;
}

export function generateAllPossibleGuesses(): Code[] {
  const allGuesses: Code[] = [];
  
  for (const c1 of COLORS) {
    for (const c2 of COLORS) {
      for (const c3 of COLORS) {
        for (const c4 of COLORS) {
          allGuesses.push([c1, c2, c3, c4]);
        }
      }
    }
  }
  
  return allGuesses;
}

export function generateAllPossibleFeedback(): Feedback[] {
  const allFeedback: Feedback[] = [];
  
  for (let black = 0; black <= 4; black++) {
    for (let white = 0; white <= 4 - black; white++) {
      if (black === 4 && white > 0) continue;
      allFeedback.push({ black, white });
    }
  }
  
  return allFeedback;
}

export function calculateFeedback(guess: Code, secret: Code): Feedback {
  let black = 0;
  let white = 0;
  
  const secretCounts: Record<Color, number> = { R: 0, G: 0, B: 0, Y: 0, O: 0, P: 0 };
  const guessCounts: Record<Color, number> = { R: 0, G: 0, B: 0, Y: 0, O: 0, P: 0 };
  
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      black++;
    } else {
      secretCounts[secret[i]]++;
      guessCounts[guess[i]]++;
    }
  }
  
  for (const color of COLORS) {
    white += Math.min(secretCounts[color], guessCounts[color]);
  }
  
  return { black, white };
}

export function filterPossibleSolutions(
  possibleSolutions: Code[],
  guess: Code,
  feedback: Feedback
): Code[] {
  return possibleSolutions.filter(solution => {
    const calculatedFeedback = calculateFeedback(guess, solution);
    return calculatedFeedback.black === feedback.black && 
           calculatedFeedback.white === feedback.white;
  });
}
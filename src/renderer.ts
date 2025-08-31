import { GameState, Code, Color, PlayerCode, PlayerColor, COLORS, COLOR_NAMES, COLOR_STYLES, GuessWithFeedback } from './types.js';
import { calculateFeedback } from './game-logic.js';

export function renderGame(
  state: GameState, 
  playerInputColors: PlayerCode, 
  onColorChange: (index: number, color: PlayerColor) => void
): void {
  renderGameBoard(state);
  renderPlayerInput(playerInputColors, onColorChange, state.gameEnded);
  renderSubmitButton(playerInputColors, state.gameEnded);
  renderResult(state);
}

function renderGameBoard(state: GameState): void {
  const gameBoard = document.getElementById('game-board');
  if (!gameBoard) return;

  gameBoard.innerHTML = '';

  state.pastGuesses.forEach((guessData) => {
    const row = createGuessRow(guessData);
    gameBoard.appendChild(row);
  });

  if (state.playerGuess) {
    const playerRow = createPlayerGuessRow(state.playerGuess, state.secret, state.playerWon);
    gameBoard.appendChild(playerRow);
  }
}

function createGuessRow(guessData: GuessWithFeedback): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'guess-row';

  const guessContainer = document.createElement('div');
  guessContainer.className = 'guess-pegs';
  
  guessData.guess.forEach((color) => {
    const peg = createPeg(color);
    guessContainer.appendChild(peg);
  });

  const feedbackContainer = document.createElement('div');
  feedbackContainer.className = 'feedback-pegs';
  
  for (let i = 0; i < guessData.feedback.black; i++) {
    const blackPeg = createFeedbackPeg('black');
    feedbackContainer.appendChild(blackPeg);
  }
  
  for (let i = 0; i < guessData.feedback.white; i++) {
    const whitePeg = createFeedbackPeg('white');
    feedbackContainer.appendChild(whitePeg);
  }

  row.appendChild(guessContainer);
  row.appendChild(feedbackContainer);
  return row;
}

function createPlayerGuessRow(playerGuess: Code, secret: Code, playerWon: boolean): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'guess-row';
  row.style.border = playerWon ? '3px solid #4CAF50' : '3px solid #f44336';

  const guessContainer = document.createElement('div');
  guessContainer.className = 'guess-pegs';
  
  playerGuess.forEach((color) => {
    const peg = createPeg(color);
    guessContainer.appendChild(peg);
  });

  const feedbackContainer = document.createElement('div');
  feedbackContainer.className = 'feedback-pegs';

  const feedback = calculateFeedback(playerGuess, secret);
  
  for (let i = 0; i < feedback.black; i++) {
    const blackPeg = createFeedbackPeg('black');
    feedbackContainer.appendChild(blackPeg);
  }
  
  for (let i = 0; i < feedback.white; i++) {
    const whitePeg = createFeedbackPeg('white');
    feedbackContainer.appendChild(whitePeg);
  }

  row.appendChild(guessContainer);
  row.appendChild(feedbackContainer);

  if (!playerWon) {
    const secretContainer = document.createElement('div');
    secretContainer.style.marginLeft = '20px';
    secretContainer.innerHTML = '<strong>Secret: </strong>';
    
    const secretPegs = document.createElement('div');
    secretPegs.className = 'guess-pegs';
    secretPegs.style.display = 'inline-flex';
    secretPegs.style.marginLeft = '10px';
    
    secret.forEach((color) => {
      const peg = createPeg(color);
      peg.style.width = '30px';
      peg.style.height = '30px';
      secretPegs.appendChild(peg);
    });
    
    secretContainer.appendChild(secretPegs);
    row.appendChild(secretContainer);
  }

  return row;
}

function createPeg(color: Color): HTMLDivElement {
  const peg = document.createElement('div');
  peg.className = 'peg';
  peg.style.backgroundColor = COLOR_STYLES[color];
  peg.textContent = color;
  return peg;
}

function createFeedbackPeg(type: 'black' | 'white'): HTMLDivElement {
  const peg = document.createElement('div');
  peg.className = 'feedback-peg';
  peg.style.backgroundColor = type === 'black' ? '#000' : '#fff';
  if (type === 'white') {
    peg.style.border = '1px solid #000';
  }
  return peg;
}

function renderPlayerInput(
  playerInputColors: PlayerCode, 
  onColorChange: (index: number, color: PlayerColor) => void,
  gameEnded: boolean
): void {
  const playerInput = document.getElementById('player-input');
  if (!playerInput) return;

  if (gameEnded) {
    playerInput.innerHTML = '';
    return;
  }

  // Check if selectors already exist
  const existingSelectors = playerInput.querySelectorAll('select.color-selector');
  
  if (existingSelectors.length !== playerInputColors.length) {
    // Need to recreate all selectors
    playerInput.innerHTML = '';
    
    playerInputColors.forEach((_, index) => {
      const selector = document.createElement('select');
      selector.className = 'color-selector';
      selector.id = `color-selector-${index}`;
      
      // Add blank option
      const blankOption = document.createElement('option');
      blankOption.value = '';
      blankOption.textContent = '---';
      selector.appendChild(blankOption);
      
      COLORS.forEach((color) => {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = COLOR_NAMES[color];
        selector.appendChild(option);
      });

      selector.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const value = target.value === '' ? null : target.value as Color;
        onColorChange(index, value);
      });

      playerInput.appendChild(selector);
    });
  }
  
  // Update existing selectors' values without recreating them
  playerInputColors.forEach((selectedColor, index) => {
    const selector = document.getElementById(`color-selector-${index}`) as HTMLSelectElement;
    if (selector) {
      const value = selectedColor === null ? '' : selectedColor;
      if (selector.value !== value) {
        selector.value = value;
      }
    }
  });
}

function renderSubmitButton(playerInputColors: PlayerCode, gameEnded: boolean): void {
  const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
  if (!submitButton) return;

  if (gameEnded) {
    submitButton.disabled = true;
  } else {
    const hasBlankColors = playerInputColors.some(color => color === null);
    submitButton.disabled = hasBlankColors;
  }
}

function renderResult(state: GameState): void {
  const resultDiv = document.getElementById('result');
  if (!resultDiv) return;

  if (!state.gameEnded) {
    resultDiv.textContent = '';
    return;
  }

  if (state.playerWon) {
    resultDiv.textContent = 'Correct!';
    resultDiv.className = 'result correct';
  } else {
    resultDiv.textContent = 'Incorrect! The secret is shown above.';
    resultDiv.className = 'result incorrect';
  }
}
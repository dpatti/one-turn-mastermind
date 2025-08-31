import { GameState, Code, Color, PlayerCode, PlayerColor, COLORS, COLOR_NAMES, COLOR_STYLES, GuessWithFeedback, CandidateCode } from './types.js';
import { calculateFeedback } from './game-logic.js';

export function renderGame(
  state: GameState,
  playerInputColors: PlayerCode,
  candidateColors: CandidateCode,
  advancedMode: boolean,
  onColorChange: (index: number, color: PlayerColor) => void,
  onCandidateChange: (index: number, color: Color, checked: boolean) => void,
  onToggleAdvancedMode: () => void
): void {
  renderGameBoard(state);
  renderModeToggle(advancedMode, onToggleAdvancedMode, state.gameEnded);
  if (advancedMode) {
    renderAdvancedInput(playerInputColors, candidateColors, onCandidateChange, state.gameEnded, advancedMode, onToggleAdvancedMode);
  } else {
    renderPlayerInput(playerInputColors, onColorChange, state.gameEnded, advancedMode, onToggleAdvancedMode);
  }
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

function renderModeToggle(advancedMode: boolean, _onToggle: () => void, gameEnded: boolean): void {
  // The toggle button will be added directly to the player input container
  // This function just ensures the button exists and has the right text
  if (gameEnded) {
    return;
  }

  const toggleButton = document.getElementById('mode-toggle') as HTMLButtonElement;
  if (toggleButton) {
    toggleButton.textContent = advancedMode ? 'Switch to Simple Mode' : 'Switch to Advanced Mode';
  }
}

function createToggleButton(advancedMode: boolean, onToggle: () => void): HTMLButtonElement {
  const toggleButton = document.createElement('button');
  toggleButton.id = 'mode-toggle';
  toggleButton.className = 'mode-toggle-button';
  toggleButton.textContent = advancedMode ? 'Switch to Simple Mode' : 'Switch to Advanced Mode';
  toggleButton.style.padding = '10px 20px';
  toggleButton.style.background = '#607D8B';
  toggleButton.style.color = 'white';
  toggleButton.style.border = 'none';
  toggleButton.style.borderRadius = '5px';
  toggleButton.style.cursor = 'pointer';
  toggleButton.style.fontSize = '14px';
  toggleButton.style.whiteSpace = 'nowrap';
  toggleButton.style.alignSelf = 'flex-end';
  toggleButton.style.marginLeft = 'auto';
  toggleButton.addEventListener('click', onToggle);
  return toggleButton;
}

function renderAdvancedInput(
  playerInputColors: PlayerCode,
  candidateColors: CandidateCode,
  onCandidateChange: (index: number, color: Color, checked: boolean) => void,
  gameEnded: boolean,
  advancedMode: boolean,
  onToggleAdvancedMode: () => void
): void {
  // Create or get the main container
  let container = document.getElementById('player-input-container');
  if (!container) {
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) return;

    container = document.createElement('div');
    container.id = 'player-input-container';
    container.className = 'player-input';
    container.style.marginBottom = '20px';
    gameBoard.insertAdjacentElement('afterend', container);
  }

  let playerInput = document.getElementById('player-input');
  if (!playerInput) {
    playerInput = document.createElement('div');
    playerInput.id = 'player-input';
    container.appendChild(playerInput);
  }

  if (gameEnded) {
    playerInput.innerHTML = '';
    return;
  }

  playerInput.innerHTML = '';
  playerInput.className = 'player-input-advanced';
  playerInput.style.display = 'flex';
  playerInput.style.flexWrap = 'wrap';
  playerInput.style.alignItems = 'flex-end';
  playerInput.style.gap = '20px';
  playerInput.style.marginBottom = '20px';

  for (let i = 0; i < 4; i++) {
    const slotContainer = document.createElement('div');
    slotContainer.className = 'slot-container';
    slotContainer.style.border = '2px solid #333';
    slotContainer.style.borderRadius = '8px';
    slotContainer.style.padding = '12px';
    slotContainer.style.background = '#f8f8f8';


    // Only show selected color when exactly one candidate is selected
    const selectedColor = playerInputColors[i];
    if (selectedColor && candidateColors[i].size === 1) {
      const selectedPeg = createPeg(selectedColor);
      selectedPeg.style.margin = '0 auto 10px';
      slotContainer.appendChild(selectedPeg);
    } else {
      // Show a placeholder when no selection or multiple candidates
      const placeholder = document.createElement('div');
      placeholder.style.width = '40px';
      placeholder.style.height = '40px';
      placeholder.style.margin = '0 auto 10px';
      placeholder.style.border = '2px dashed #999';
      placeholder.style.borderRadius = '50%';
      placeholder.style.display = 'flex';
      placeholder.style.alignItems = 'center';
      placeholder.style.justifyContent = 'center';
      placeholder.style.fontSize = '18px';
      placeholder.style.color = '#999';
      placeholder.textContent = '?';
      slotContainer.appendChild(placeholder);
    }

    const checkboxContainer = document.createElement('div');
    checkboxContainer.style.display = 'flex';
    checkboxContainer.style.flexDirection = 'column';
    checkboxContainer.style.gap = '6px';

    COLORS.forEach((color) => {
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.cursor = 'pointer';
      label.style.padding = '4px';
      label.style.borderRadius = '4px';
      label.style.transition = 'background 0.2s';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = candidateColors[i].has(color);
      checkbox.style.marginRight = '8px';
      checkbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        onCandidateChange(i, color, target.checked);
      });

      const colorBox = document.createElement('div');
      colorBox.style.width = '20px';
      colorBox.style.height = '20px';
      colorBox.style.backgroundColor = COLOR_STYLES[color];
      colorBox.style.border = '1px solid #333';
      colorBox.style.borderRadius = '3px';
      colorBox.style.marginRight = '6px';

      const colorName = document.createElement('span');
      colorName.textContent = color;
      colorName.style.fontSize = '14px';

      label.appendChild(checkbox);
      label.appendChild(colorBox);
      label.appendChild(colorName);

      label.addEventListener('mouseenter', () => {
        label.style.background = '#e0e0e0';
      });
      label.addEventListener('mouseleave', () => {
        label.style.background = 'transparent';
      });

      checkboxContainer.appendChild(label);
    });

    slotContainer.appendChild(checkboxContainer);
    playerInput.appendChild(slotContainer);
  }

  // Add toggle button
  const existingToggle = document.getElementById('mode-toggle');
  if (!existingToggle) {
    const toggleButton = createToggleButton(advancedMode, onToggleAdvancedMode);
    playerInput.appendChild(toggleButton);
  }
}

function renderPlayerInput(
  playerInputColors: PlayerCode,
  onColorChange: (index: number, color: PlayerColor) => void,
  gameEnded: boolean,
  advancedMode: boolean,
  onToggleAdvancedMode: () => void
): void {
  // Create or get the main container
  let container = document.getElementById('player-input-container');
  if (!container) {
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) return;

    container = document.createElement('div');
    container.id = 'player-input-container';
    container.className = 'player-input';
    container.style.marginBottom = '20px';
    gameBoard.insertAdjacentElement('afterend', container);
  }

  let playerInput = document.getElementById('player-input');
  if (!playerInput) {
    playerInput = document.createElement('div');
    playerInput.id = 'player-input';
    container.appendChild(playerInput);
  }

  if (gameEnded) {
    playerInput.innerHTML = '';
    return;
  }

  playerInput.className = 'player-input';
  playerInput.style.display = 'flex';
  playerInput.style.flexWrap = 'wrap';
  playerInput.style.alignItems = 'center';
  playerInput.style.gap = '10px';

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

  // Add toggle button
  const existingToggle = document.getElementById('mode-toggle');
  if (!existingToggle) {
    const toggleButton = createToggleButton(advancedMode, onToggleAdvancedMode);
    playerInput.appendChild(toggleButton);
  }
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
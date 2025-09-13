# Claude Code Session Notes

## Project Overview
One Guess Mastermind - A puzzle game where players try to deduce a secret 4-color code based on feedback from past guesses. Built with TypeScript, Vite, and vanilla JavaScript.

## Key Files & Structure
- `src/main.ts` - Main game logic and state management
- `src/renderer.ts` - UI rendering functions
- `src/types.ts` - TypeScript type definitions
- `src/puzzle-serializer.ts` - Serialization for sharing puzzles
- `src/game-logic.ts` - Core game mechanics and feedback calculation
- `index.html` - Main HTML with inline CSS

## Development Commands
- `bun run dev` - Start development server (usually runs on port 5173, falls back to 5174)
- `bun run build` - Build for production
- `bun run typecheck` - Run TypeScript type checking
- `bun run lint` - Run ESLint (use `bun run lint -- --fix` to auto-fix issues)
- **IMPORTANT**: Run `bun run lint` after each code change to catch linting issues early

## Recent Major Features

### Advanced Input Mode
- Toggle between simple dropdown mode and advanced candidate tracking mode
- Advanced mode allows checking multiple possible colors per position
- Only validates when exactly one candidate is selected per position
- Shows "?" placeholder when 0 or >1 candidates selected
- Toggle button is right-aligned inline with input elements

### Serialization Format (Version 1.x)
- Compact bitshifting approach: each color (1-6) packed into 3 bits
- Format: `1.` prefix + base36 encoded values (3 chars per 4-color code)
- No delimiter needed - fixed 3-character chunks
- Example: `1.abc123def` represents secret + 2 guesses
- Much more compact than previous base64 approach

## Code Patterns & Conventions

### State Management
- Game state in `main.ts` includes: secret, pastGuesses, playerGuess, gameEnded, playerWon
- Player input tracked separately: `playerInputColors` (simple mode) and `candidateColors` (advanced mode)
- Advanced mode flag: `advancedMode` boolean

### Rendering Architecture
- `renderGame()` is the main entry point, delegates to specialized render functions
- Mode-specific rendering: `renderPlayerInput()` vs `renderAdvancedInput()`
- Toggle button created inline with input elements using flexbox + `marginLeft: 'auto'`

### TypeScript Types
- `Color` = 'R' | 'G' | 'B' | 'Y' | 'O' | 'P'
- `Code` = [Color, Color, Color, Color] (4-tuple)
- `PlayerCode` = [PlayerColor, PlayerColor, PlayerColor, PlayerColor] where PlayerColor = Color | null
- `CandidateCode` = [Set<Color>, Set<Color>, Set<Color>, Set<Color>]

## Styling Notes
- Uses inline CSS in `index.html`
- `.player-input` class provides standard spacing (`margin-bottom: 20px`)
- Advanced mode manually sets `marginBottom: '20px'` since it uses custom className
- Color pegs: 40px circles with `COLOR_STYLES` mapping
- Responsive layout uses flexbox with `flexWrap: 'wrap'`

## Common Issues & Solutions

### Linting
- Watch out for trailing spaces - use `bun run lint -- --fix`
- Unused parameters should be prefixed with `_` (e.g., `_onToggle`)

### Layout Issues
- Toggle button alignment: use `marginLeft: 'auto'` in flexbox
- Missing margins: ensure proper className or manual style setting
- Container creation: check if elements exist before creating new ones

### TypeScript
- Import `Color` type when using it in functions
- Use `as HTMLElementType` for DOM element casting
- Return type annotations help catch errors early

## Puzzle Sharing
- URLs use `?puzzle=` query parameter with serialized game state
- Sharing preserves secret + past guesses, allows others to attempt the final guess
- Share button copies URL to clipboard with success feedback

## Testing Notes
- Game loads puzzle from URL on startup (falls back to random if invalid)
- All modes should properly validate before allowing submission
- Toggle between modes should preserve selections where possible
- Colors: Red, Green, Blue, Yellow, Orange, Purple (R,G,B,Y,O,P)
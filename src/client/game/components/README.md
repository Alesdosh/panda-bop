# Game Components

This directory contains modular components for the drag button game functionality.

## Architecture

The game logic has been split into focused, reusable components:

### PathManager (`PathManager.ts`)
Handles all path-related calculations and rendering:
- **Path Creation**: Generates curved path points based on screen dimensions
- **Path Calculations**: Computes segment lengths and positions along the path
- **Position Mapping**: Converts between screen coordinates and path progress
- **Path Rendering**: Draws the path and progress visualization

**Key Methods:**
- `createPath(centerX, centerY, scaleFactor)` - Creates the path points
- `getPositionOnPath(progress)` - Gets position at specific progress (0-1)
- `getProgressFromPosition(x, y)` - Finds closest progress for screen coordinates
- `drawPath(graphics)` - Renders the main path
- `drawProgressPath(graphics, progress)` - Renders completed portion

### EffectsManager (`EffectsManager.ts`)
Manages all visual effects and animations:
- **Success Effects**: Particle explosions and completion animations
- **Failure Effects**: Red flash, shake, and fade out animations
- **Interactive Effects**: Pulse and scaling effects during interaction

**Key Methods:**
- `createSuccessParticles(position)` - Spawns celebration particles
- `createCompletionEffect(target, onComplete)` - Success animation
- `createFailureEffect(target, circleGraphics, onComplete)` - Failure animation
- `createPulseEffect(target, progress)` - Smooth scaling during movement

### DragButton (`DragButton.ts`)
Main component that orchestrates the draggable button functionality:
- **State Management**: Tracks dragging, completion, and failure states
- **Event Handling**: Manages all pointer/touch interactions
- **Validation**: Checks if cursor stays within path tolerance
- **Integration**: Coordinates between PathManager and EffectsManager

**Key Features:**
- Configurable tolerance and timing settings
- Automatic failure detection when cursor leaves path
- Support for both mouse and touch interactions
- Callback system for completion and failure events

**Configuration Options:**
```typescript
interface DragButtonConfig {
  tolerance: number;           // Distance tolerance from path (default: 60px)
  maxBackwardMovement: number; // Allowed backward progress (default: 0.05)
  failureTimeoutMs: number;    // Time before failure when off-path (default: 300ms)
}
```

## Usage

```typescript
import { DragButton, PathManager, EffectsManager } from '../components';

// In your Phaser scene
const pathManager = new PathManager();
const effectsManager = new EffectsManager(this);
const dragButton = new DragButton(this, pathManager, effectsManager);

// Setup callbacks
dragButton.setOnComplete(() => {
  console.log('Button completed!');
});

dragButton.setOnFailure(() => {
  console.log('Button failed!');
});

// Create the button
dragButton.create(centerX, centerY, scaleFactor);
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused in other scenes or games
3. **Testability**: Individual components can be tested in isolation
4. **Maintainability**: Changes to one aspect don't affect others
5. **Configurability**: Easy to adjust behavior through configuration objects
6. **Extensibility**: New effects or path types can be added without changing existing code

## File Structure

```
components/
├── PathManager.ts      # Path calculations and rendering
├── EffectsManager.ts   # Visual effects and animations
├── DragButton.ts       # Main drag button component
├── index.ts           # Component exports
└── README.md          # This documentation
```

The main `Game.ts` scene is now much cleaner and focuses on game-level logic rather than implementation details.

# Drag Button System - Usage Guide

## Quick Start

The new drag button system makes it incredibly easy to create multiple draggable components with different paths and configurations.

### Basic Setup

```typescript
import { DragButtonManager, PathType } from '../components';

// In your Phaser scene
private dragButtonManager: DragButtonManager;

create() {
  // Initialize the manager
  this.dragButtonManager = new DragButtonManager(this);
  
  // Create buttons
  this.createButtons();
}

private createButtons() {
  const width = this.scale.width;
  const height = this.scale.height;
  const scaleFactor = this.calculateScaleFactor(width, height);
  
  // Your button creation code here...
}
```

## 1. Simple Button Creation

### Single Button
```typescript
// Create one button with minimal configuration
this.dragButtonManager.createSimpleButton(
  'my_button',           // unique ID
  width / 2,             // x position
  height / 2,            // y position
  PathType.HEART,        // path type
  100,                   // size
  scaleFactor            // scale factor
);
```

### Multiple Individual Buttons
```typescript
// Create several buttons one by one
this.dragButtonManager.createSimpleButton('heart1', width * 0.2, height * 0.5, PathType.HEART, 80, scaleFactor);
this.dragButtonManager.createSimpleButton('spiral1', width * 0.4, height * 0.5, PathType.SPIRAL, 80, scaleFactor);
this.dragButtonManager.createSimpleButton('zigzag1', width * 0.6, height * 0.5, PathType.ZIGZAG, 80, scaleFactor);
this.dragButtonManager.createSimpleButton('circle1', width * 0.8, height * 0.5, PathType.CIRCLE, 80, scaleFactor);
```

## 2. Layout-Based Creation

### Grid Layout
```typescript
// Create a 2x2 grid of buttons
const pathTypes = [PathType.CURVED_UP, PathType.SPIRAL, PathType.ZIGZAG, PathType.CIRCLE];

this.dragButtonManager.createButtonGrid(
  width * 0.25,    // startX
  height * 0.25,   // startY
  2,               // columns
  2,               // rows
  width * 0.25,    // spacing between buttons
  pathTypes,       // array of path types to cycle through
  80,              // button size
  scaleFactor
);
```

### Circular Layout
```typescript
// Create buttons arranged in a circle
const pathTypes = [PathType.HEART, PathType.S_CURVE, PathType.STRAIGHT_LINE, PathType.CURVED_DOWN];

this.dragButtonManager.createButtonCircle(
  width / 2,       // center X
  height / 2,      // center Y
  150,             // radius
  6,               // number of buttons
  pathTypes,       // path types to cycle through
  70,              // button size
  scaleFactor
);
```

## 3. Advanced Custom Configuration

### Individual Custom Buttons
```typescript
this.dragButtonManager.createButton({
  id: 'precision_spiral',
  position: { x: width * 0.3, y: height * 0.3 },
  pathConfig: {
    type: PathType.SPIRAL,
    size: 100,
    rotation: Math.PI / 6,    // rotate 30 degrees
    offsetX: 20,              // offset from center
    offsetY: -10
  },
  buttonConfig: {
    tolerance: 40,            // stricter tolerance
    failureTimeoutMs: 200,    // quick failure
    maxBackwardMovement: 0.02 // less backward movement allowed
  },
  onComplete: () => console.log('🎯 Precision spiral completed!'),
  onFailure: () => console.log('❌ Try again!'),
  autoRecreate: false,        // don't recreate on failure
  recreateDelay: 2000         // delay before recreating (if autoRecreate is true)
}, scaleFactor);
```

### Multiple Custom Buttons
```typescript
const definitions = [
  {
    id: 'easy_heart',
    position: { x: width * 0.2, y: height * 0.5 },
    pathConfig: { type: PathType.HEART, size: 120 },
    buttonConfig: { tolerance: 80, failureTimeoutMs: 500 },
    onComplete: () => console.log('💖 Heart completed!')
  },
  {
    id: 'hard_spiral',
    position: { x: width * 0.8, y: height * 0.5 },
    pathConfig: { type: PathType.SPIRAL, size: 80, rotation: Math.PI / 4 },
    buttonConfig: { tolerance: 30, failureTimeoutMs: 150 },
    onComplete: () => console.log('🌀 Spiral mastered!'),
    autoRecreate: false
  }
];

this.dragButtonManager.createButtons(definitions, scaleFactor);
```

## 4. Available Path Types

```typescript
PathType.CURVED_UP      // Original curved path going up
PathType.CURVED_DOWN    // Curved path going down
PathType.SPIRAL         // Spiral from center outward
PathType.ZIGZAG         // Zigzag pattern
PathType.CIRCLE         // Complete circle
PathType.STRAIGHT_LINE  // Simple straight line
PathType.S_CURVE        // S-shaped curve
PathType.HEART          // Heart shape
```

## 5. Configuration Options

### Path Configuration
```typescript
interface PathConfig {
  type: PathType;        // Required: type of path
  size: number;          // Required: size of the path
  rotation?: number;     // Optional: rotation in radians
  offsetX?: number;      // Optional: X offset from center
  offsetY?: number;      // Optional: Y offset from center
}
```

### Button Configuration
```typescript
interface DragButtonConfig {
  tolerance: number;           // Distance tolerance from path (default: 60)
  maxBackwardMovement: number; // Allowed backward progress (default: 0.05)
  failureTimeoutMs: number;    // Time before failure when off-path (default: 300)
}
```

### Button Definition
```typescript
interface DragButtonDefinition {
  id: string;                    // Unique identifier
  position: { x: number; y: number }; // Screen position
  pathConfig: PathConfig;        // Path configuration
  buttonConfig?: Partial<DragButtonConfig>; // Optional button settings
  onComplete?: () => void;       // Completion callback
  onFailure?: () => void;        // Failure callback
  autoRecreate?: boolean;        // Auto-recreate on failure (default: true)
  recreateDelay?: number;        // Delay before recreating (default: 1000ms)
}
```

## 6. Manager Methods

### Status Checking
```typescript
// Check if all buttons are completed
if (this.dragButtonManager.areAllButtonsCompleted()) {
  console.log('🎉 Level completed!');
}

// Get counts
const activeCount = this.dragButtonManager.getActiveButtonCount();
const completedCount = this.dragButtonManager.getCompletedButtonCount();

// Get detailed states
const states = this.dragButtonManager.getButtonStates();
// Returns: { [buttonId]: { completed: boolean, active: boolean } }
```

### Management
```typescript
// Remove specific button
this.dragButtonManager.removeButton('button_id');

// Remove all buttons
this.dragButtonManager.removeAllButtons();

// Update layout (call in your updateLayout method)
this.dragButtonManager.updateLayout(width, height, scaleFactor);
```

## 7. Complete Example

```typescript
private createGameLevel(): void {
  const width = this.scale.width;
  const height = this.scale.height;
  const scaleFactor = this.calculateScaleFactor(width, height);

  // Easy buttons (forgiving settings)
  this.dragButtonManager.createButtonGrid(
    width * 0.1, height * 0.2, 2, 1,
    width * 0.3,
    [PathType.STRAIGHT_LINE, PathType.CIRCLE],
    100, scaleFactor
  );

  // Medium difficulty
  this.dragButtonManager.createSimpleButton(
    'medium_heart', width * 0.5, height * 0.5, 
    PathType.HEART, 80, scaleFactor
  );

  // Hard challenge
  this.dragButtonManager.createButton({
    id: 'expert_spiral',
    position: { x: width * 0.8, y: height * 0.7 },
    pathConfig: { 
      type: PathType.SPIRAL, 
      size: 60, 
      rotation: Math.PI / 3 
    },
    buttonConfig: { 
      tolerance: 25, 
      failureTimeoutMs: 100 
    },
    onComplete: () => this.checkLevelComplete(),
    autoRecreate: false
  }, scaleFactor);
}

private checkLevelComplete(): void {
  if (this.dragButtonManager.areAllButtonsCompleted()) {
    console.log('🏆 Level Complete! Moving to next level...');
    // Load next level or show completion screen
  }
}
```

This system gives you maximum flexibility while keeping the API simple for basic use cases!

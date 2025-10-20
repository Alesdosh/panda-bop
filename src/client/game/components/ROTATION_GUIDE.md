# Button Rotation System

## Overview

The drag button system now supports **rotation** for both the path and the draggable circle. This allows you to create more varied and interesting layouts by rotating buttons to any angle.

## How Rotation Works

### 1. **Path Rotation**
- The entire path (zigzag, heart, spiral, etc.) is rotated around its center point
- Rotation is applied using the existing `PathManager.rotatePoints()` method
- Both the visible path and the invisible collision detection are rotated

### 2. **Circle Rotation**
- The draggable circle container is also rotated to match the path
- This ensures visual consistency between the path and the interactive element

### 3. **Coordinate System**
- Rotation is measured in **radians** internally
- Convenience methods accept **degrees** for easier use
- Positive rotation = clockwise, negative rotation = counterclockwise

## Usage Examples

### Basic Rotation (Radians)

```typescript
// Create button with 45-degree rotation (π/4 radians)
this.dragButtonManager.createSimpleButton(
  'rotated_heart', 
  300, 200, 
  PathType.HEART, 
  80, 
  scaleFactor, 
  Math.PI / 4  // 45 degrees in radians
);
```

### Convenient Rotation (Degrees)

```typescript
// Same button using the degrees convenience method
this.dragButtonManager.createSimpleButtonDegrees(
  'rotated_heart', 
  300, 200, 
  PathType.HEART, 
  80, 
  scaleFactor, 
  45  // 45 degrees
);
```

### Advanced Custom Rotation

```typescript
this.dragButtonManager.createButton({
  id: 'custom_rotated',
  position: { x: 400, y: 300 },
  pathConfig: {
    type: PathType.SPIRAL,
    size: 100,
    // Note: pathConfig.rotation is combined with button rotation
    rotation: Math.PI / 6  // Additional 30-degree path rotation
  },
  rotation: Math.PI / 3,   // 60-degree button rotation
  onComplete: () => console.log('Rotated spiral completed!')
}, scaleFactor);
```

### Grid with Random Rotations

```typescript
// Create a grid where each button has a different rotation
const rotations = [0, 45, 90, 135, 180, 225, 270, 315]; // degrees

this.dragButtonManager.createButtonGrid(
  100, 100,           // start position
  3, 3,               // 3x3 grid
  150,                // spacing
  [PathType.HEART, PathType.ZIGZAG, PathType.SPIRAL],
  80,                 // size
  scaleFactor,
  rotations.map(deg => deg * Math.PI / 180) // convert to radians
);
```

### Circular Layout with Auto-Rotation

```typescript
// Buttons arranged in a circle, each rotated to face outward
this.dragButtonManager.createButtonCircle(
  400, 300,           // center
  150,                // radius
  8,                  // 8 buttons
  [PathType.HEART, PathType.ZIGZAG],
  60,                 // size
  scaleFactor,
  true                // autoRotate = true (face outward)
);
```

## API Reference

### DragButtonManager Methods

#### `createSimpleButton()`
```typescript
createSimpleButton(
  id: string,
  x: number,
  y: number,
  pathType: PathType,
  size: number = 100,
  scaleFactor: number = 1,
  rotation: number = 0  // NEW: rotation in radians
): void
```

#### `createSimpleButtonDegrees()` (New)
```typescript
createSimpleButtonDegrees(
  id: string,
  x: number,
  y: number,
  pathType: PathType,
  size: number = 100,
  scaleFactor: number = 1,
  rotationDegrees: number = 0  // rotation in degrees
): void
```

#### `createButtonGrid()` (Enhanced)
```typescript
createButtonGrid(
  startX: number,
  startY: number,
  cols: number,
  rows: number,
  spacing: number,
  pathTypes: PathType[],
  size: number = 80,
  scaleFactor: number = 1,
  rotations?: number[]  // NEW: optional array of rotations (radians)
): void
```

#### `createButtonCircle()` (Enhanced)
```typescript
createButtonCircle(
  centerX: number,
  centerY: number,
  radius: number,
  count: number,
  pathTypes: PathType[],
  size: number = 80,
  scaleFactor: number = 1,
  autoRotate: boolean = true  // NEW: auto-rotate to face outward
): void
```

### DragButtonDefinition Interface (Enhanced)

```typescript
interface DragButtonDefinition {
  id: string;
  position: { x: number; y: number };
  pathConfig: PathConfig;
  buttonConfig?: Partial<DragButtonConfig>;
  rotation?: number;  // NEW: rotation in radians
  onComplete?: () => void;
  onFailure?: () => void;
  autoRecreate?: boolean;
  recreateDelay?: number;
}
```

## Common Rotation Values

| Degrees | Radians | Description |
|---------|---------|-------------|
| 0° | 0 | No rotation |
| 45° | π/4 | Diagonal |
| 90° | π/2 | Quarter turn |
| 135° | 3π/4 | Three-quarters diagonal |
| 180° | π | Half turn (upside down) |
| 270° | 3π/2 | Three-quarter turn |
| 360° | 2π | Full rotation (same as 0°) |

## Practical Examples

### 1. **Difficulty Progression**
```typescript
// Easy: No rotation
this.dragButtonManager.createSimpleButtonDegrees('easy', 200, 200, PathType.STRAIGHT_LINE, 100, 1, 0);

// Medium: 45-degree rotation
this.dragButtonManager.createSimpleButtonDegrees('medium', 400, 200, PathType.ZIGZAG, 80, 1, 45);

// Hard: 90-degree rotation
this.dragButtonManager.createSimpleButtonDegrees('hard', 600, 200, PathType.SPIRAL, 60, 1, 90);
```

### 2. **Themed Layouts**
```typescript
// Clock face layout
for (let hour = 0; hour < 12; hour++) {
  const angle = (hour * 30) - 90; // 30 degrees per hour, start at 12 o'clock
  const x = centerX + Math.cos(angle * Math.PI / 180) * radius;
  const y = centerY + Math.sin(angle * Math.PI / 180) * radius;
  
  this.dragButtonManager.createSimpleButtonDegrees(
    `hour_${hour}`, x, y, PathType.HEART, 40, 1, angle
  );
}
```

### 3. **Random Orientations**
```typescript
// Create buttons with random rotations for variety
for (let i = 0; i < 5; i++) {
  const randomRotation = Math.random() * 360; // 0-360 degrees
  this.dragButtonManager.createSimpleButtonDegrees(
    `random_${i}`, 
    100 + i * 150, 300, 
    PathType.HEART, 
    80, 1, 
    randomRotation
  );
}
```

## Technical Notes

- **Performance**: Rotation is calculated once during creation, not every frame
- **Collision Detection**: The sequential movement system works correctly with rotated paths
- **Responsive**: Rotations are maintained during screen resize
- **Combination**: Button rotation and path rotation can be combined for complex effects

The rotation system adds a new dimension of variety and challenge to your drag button games!

import { DragButtonManager, DragButtonDefinition } from './DragButtonManager';
import { PathType } from './PathManager';
import * as Phaser from 'phaser';

/**
 * Collection of example configurations for creating drag buttons
 */
export class DragButtonExamples {
  
  /**
   * Creates a simple single button in the center
   */
  static createSingleButton(manager: DragButtonManager, width: number, height: number, scaleFactor: number): void {
    manager.createSimpleButton(
      'center_button',
      width / 2,
      height / 2,
      PathType.CURVED_UP,
      100,
      scaleFactor
    );
  }

  /**
   * Creates a 2x2 grid of different path types
   */
  static createBasicGrid(manager: DragButtonManager, width: number, height: number, scaleFactor: number): void {
    const pathTypes = [PathType.CURVED_UP, PathType.SPIRAL, PathType.ZIGZAG, PathType.CIRCLE];
    
    manager.createButtonGrid(
      width * 0.25,  // startX
      height * 0.25, // startY
      2,             // cols
      2,             // rows
      width * 0.25,  // spacing
      pathTypes,
      80,            // size
      scaleFactor
    );
  }

  /**
   * Creates buttons in a circular arrangement
   */
  static createCircularLayout(manager: DragButtonManager, width: number, height: number, scaleFactor: number): void {
    const pathTypes = [PathType.HEART, PathType.S_CURVE, PathType.STRAIGHT_LINE, PathType.CURVED_DOWN];
    
    manager.createButtonCircle(
      width / 2,     // centerX
      height / 2,    // centerY
      150,           // radius
      6,             // count
      pathTypes,
      70,            // size
      scaleFactor
    );
  }

  /**
   * Creates advanced buttons with custom configurations
   */
  static createAdvancedButtons(manager: DragButtonManager, width: number, height: number, scaleFactor: number): void {
    const definitions: DragButtonDefinition[] = [
      {
        id: 'precision_spiral',
        position: { x: width * 0.2, y: height * 0.3 },
        pathConfig: {
          type: PathType.SPIRAL,
          size: 100,
          rotation: Math.PI / 6,
        },
        buttonConfig: {
          tolerance: 30,        // Strict tolerance
          failureTimeoutMs: 150, // Quick failure
        },
        onComplete: () => console.log('🎯 Precision spiral mastered!'),
        autoRecreate: false,
      },
      {
        id: 'forgiving_heart',
        position: { x: width * 0.8, y: height * 0.3 },
        pathConfig: {
          type: PathType.HEART,
          size: 120,
        },
        buttonConfig: {
          tolerance: 100,       // Very forgiving
          maxBackwardMovement: 0.15, // Allow more correction
          failureTimeoutMs: 500, // Slow failure
        },
        onComplete: () => console.log('💖 Heart completed with love!'),
        recreateDelay: 2000,
      },
      {
        id: 'rotated_zigzag',
        position: { x: width * 0.5, y: height * 0.7 },
        pathConfig: {
          type: PathType.ZIGZAG,
          size: 80,
          rotation: Math.PI / 4, // 45 degrees
          offsetX: 20,
          offsetY: -10,
        },
        onComplete: () => console.log('⚡ Zigzag conquered!'),
      },
    ];

    manager.createButtons(definitions, scaleFactor);
  }

  /**
   * Creates a progressive difficulty layout
   */
  static createProgressiveDifficulty(manager: DragButtonManager, width: number, height: number, scaleFactor: number): void {
    // Easy level
    manager.createButton({
      id: 'easy_line',
      position: { x: width * 0.2, y: height * 0.5 },
      pathConfig: { type: PathType.STRAIGHT_LINE, size: 100 },
      buttonConfig: { tolerance: 80, failureTimeoutMs: 1000 },
      onComplete: () => console.log('✅ Easy level completed!'),
    }, scaleFactor);

    // Medium level
    manager.createButton({
      id: 'medium_curve',
      position: { x: width * 0.5, y: height * 0.5 },
      pathConfig: { type: PathType.S_CURVE, size: 100 },
      buttonConfig: { tolerance: 60, failureTimeoutMs: 500 },
      onComplete: () => console.log('🔥 Medium level completed!'),
    }, scaleFactor);

    // Hard level
    manager.createButton({
      id: 'hard_spiral',
      position: { x: width * 0.8, y: height * 0.5 },
      pathConfig: { type: PathType.SPIRAL, size: 80 },
      buttonConfig: { tolerance: 40, failureTimeoutMs: 200 },
      onComplete: () => console.log('🏆 Hard level mastered!'),
      autoRecreate: false, // No second chances!
    }, scaleFactor);
  }

  /**
   * Creates a mini-game with multiple small buttons
   */
  static createMiniGame(manager: DragButtonManager, width: number, height: number, scaleFactor: number): void {
    const positions = [
      { x: width * 0.2, y: height * 0.2 },
      { x: width * 0.8, y: height * 0.2 },
      { x: width * 0.2, y: height * 0.8 },
      { x: width * 0.8, y: height * 0.8 },
      { x: width * 0.5, y: height * 0.1 },
      { x: width * 0.5, y: height * 0.9 },
    ];

    const pathTypes = [
      PathType.CIRCLE,
      PathType.HEART,
      PathType.ZIGZAG,
      PathType.S_CURVE,
      PathType.SPIRAL,
      PathType.CURVED_UP,
    ];

    positions.forEach((pos, index) => {
      manager.createButton({
        id: `mini_${index}`,
        position: pos,
        pathConfig: {
          type: pathTypes[index],
          size: 50,
          rotation: (index * Math.PI) / 3, // Different rotation for each
        },
        buttonConfig: {
          tolerance: 50,
          failureTimeoutMs: 300,
        },
        onComplete: () => {
          console.log(`Mini button ${index + 1} completed!`);
          // Check if all mini buttons are done
          if (manager.areAllButtonsCompleted()) {
            console.log('🎉 Mini-game completed! All buttons cleared!');
          }
        },
      }, scaleFactor);
    });
  }

  /**
   * Creates themed buttons (e.g., for a love-themed level)
   */
  static createLoveTheme(manager: DragButtonManager, width: number, height: number, scaleFactor: number): void {
    // Multiple hearts of different sizes
    const heartPositions = [
      { x: width * 0.3, y: height * 0.3, size: 80 },
      { x: width * 0.7, y: height * 0.3, size: 100 },
      { x: width * 0.5, y: height * 0.6, size: 120 },
    ];

    heartPositions.forEach((heart, index) => {
      manager.createButton({
        id: `heart_${index}`,
        position: { x: heart.x, y: heart.y },
        pathConfig: {
          type: PathType.HEART,
          size: heart.size,
          rotation: (index - 1) * (Math.PI / 8), // Slight rotation variety
        },
        buttonConfig: {
          tolerance: 70,
          failureTimeoutMs: 400,
        },
        onComplete: () => console.log(`💕 Heart ${index + 1} filled with love!`),
      }, scaleFactor);
    });
  }

  /**
   * Creates a speed challenge with quick timeouts
   */
  static createSpeedChallenge(manager: DragButtonManager, width: number, height: number, scaleFactor: number): void {
    const challenges = [
      { type: PathType.STRAIGHT_LINE, timeout: 800, tolerance: 60 },
      { type: PathType.CIRCLE, timeout: 600, tolerance: 50 },
      { type: PathType.ZIGZAG, timeout: 400, tolerance: 40 },
      { type: PathType.SPIRAL, timeout: 300, tolerance: 35 },
    ];

    challenges.forEach((challenge, index) => {
      manager.createButton({
        id: `speed_${index}`,
        position: {
          x: width * (0.2 + index * 0.2),
          y: height * 0.5,
        },
        pathConfig: {
          type: challenge.type,
          size: 80,
        },
        buttonConfig: {
          tolerance: challenge.tolerance,
          failureTimeoutMs: challenge.timeout,
        },
        onComplete: () => console.log(`⚡ Speed challenge ${index + 1} completed!`),
        onFailure: () => console.log(`💨 Too slow on challenge ${index + 1}!`),
        autoRecreate: false, // One chance only!
      }, scaleFactor);
    });
  }
}

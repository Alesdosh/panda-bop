import * as Phaser from 'phaser';
import { PathManager } from './PathManager';
import { EffectsManager } from './EffectsManager';

export interface DragButtonConfig {
  tolerance: number;
  maxBackwardMovement: number;
  failureTimeoutMs: number;
}

export class DragButton {
  private scene: Phaser.Scene;
  private pathManager: PathManager;
  private effectsManager: EffectsManager;
  private config: DragButtonConfig;

  // Visual elements
  private container: Phaser.GameObjects.Container | null = null;
  private circleGraphics: Phaser.GameObjects.Graphics | null = null;
  private pathGraphics: Phaser.GameObjects.Graphics | null = null;
  private progressGraphics: Phaser.GameObjects.Graphics | null = null;

  // State
  private isDragging: boolean = false;
  private isPointerDown: boolean = false;
  private dragStarted: boolean = false;
  private isCompleted: boolean = false;
  private pathProgress: number = 0;
  private failureTimeout: Phaser.Time.TimerEvent | null = null;
  private buttonRotation: number = 0; // Rotation in radians for the entire button

  // Callbacks
  private onCompleteCallback?: () => void;
  private onFailureCallback?: () => void;

  constructor(
    scene: Phaser.Scene,
    pathManager: PathManager,
    effectsManager: EffectsManager,
    config: DragButtonConfig = {
      tolerance: 60,
      maxBackwardMovement: 0.05,
      failureTimeoutMs: 300,
    }
  ) {
    this.scene = scene;
    this.pathManager = pathManager;
    this.effectsManager = effectsManager;
    this.config = config;
  }

  create(centerX: number, centerY: number, scaleFactor: number = 1, pathConfig?: import('./PathManager').PathConfig, rotation: number = 0): void {
    if (this.isCompleted) return;

    // Store rotation
    this.buttonRotation = rotation;

    // Create path with rotation applied
    const pathConfigWithRotation = pathConfig ? {
      ...pathConfig,
      rotation: (pathConfig.rotation || 0) + rotation
    } : { type: 'curved_up' as any, size: 100, rotation };

    this.pathManager.createPath(centerX, centerY, scaleFactor, pathConfigWithRotation);

    // Create graphics
    this.pathGraphics = this.scene.add.graphics();
    this.progressGraphics = this.scene.add.graphics();
    this.pathManager.drawPath(this.pathGraphics);

    // Create draggable circle container
    const startPoint = this.pathManager.getStartPoint();
    if (!startPoint) return;

    this.container = this.scene.add.container(startPoint.x, startPoint.y);

    // Apply rotation to the entire container
    this.container.setRotation(rotation);

    // Create the circle graphics
    this.circleGraphics = this.scene.add.graphics();
    this.drawCircle();

    this.container.add(this.circleGraphics);

    // Make it interactive - smaller but still usable hit area
    this.container.setSize(40, 40); // Reduced to match smaller circle
    this.container.setInteractive({ draggable: true });

    // Add event listeners
    this.setupEventListeners();
  }

  private drawCircle(): void {
    if (!this.circleGraphics) return;

    this.circleGraphics.clear();
    
    // Outer glow ring
    this.circleGraphics.lineStyle(4, 0x4a90e2, 0.15);
    this.circleGraphics.strokeCircle(0, 0, 22);
    
    // Middle glow ring
    this.circleGraphics.lineStyle(3, 0x4a90e2, 0.3);
    this.circleGraphics.strokeCircle(0, 0, 18);
    
    // Main circle - smaller and brighter
    this.circleGraphics.fillStyle(0x5aa0f2); // Slightly brighter blue
    this.circleGraphics.fillCircle(0, 0, 12); // Reduced from 15 to 12
    
    // White border
    this.circleGraphics.lineStyle(2, 0xffffff, 0.9);
    this.circleGraphics.strokeCircle(0, 0, 12);
    
    // Inner highlight
    this.circleGraphics.fillStyle(0xffffff, 0.4);
    this.circleGraphics.fillCircle(-2, -2, 4); // Small highlight dot
  }

  private setupEventListeners(): void {
    if (!this.container) return;

    // Drag events
    this.container.on('dragstart', this.onDragStart, this);
    this.container.on('drag', this.onDrag, this);
    this.container.on('dragend', this.onDragEnd, this);

    // Pointer events for better mobile support
    this.container.on('pointerdown', this.onPointerDown, this);
    this.container.on('pointermove', this.onPointerMove, this);
    this.container.on('pointerup', this.onPointerUp, this);

    // Global pointer events
    this.scene.input.on('pointerup', this.onGlobalPointerUp, this);
    this.scene.input.on('pointerupoutside', this.onGlobalPointerUp, this);
  }

  private onDragStart(): void {
    this.isDragging = true;
    this.dragStarted = true;
    this.pathProgress = 0;
    this.isPointerDown = true;
    this.clearFailureTimeout();
  }

  private onDrag(_pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
    if (!this.isDragging) return;
    this.updatePosition(dragX, dragY);
  }

  private onDragEnd(): void {
    this.isDragging = false;
    this.isPointerDown = false;

    if (!this.isCompleted && this.pathProgress < 0.98) {
      this.triggerFailure();
    }
  }

  private onPointerDown(): void {
    this.isDragging = true;
    this.dragStarted = true;
    this.pathProgress = 0;
    this.isPointerDown = true;
    this.clearFailureTimeout();
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.isDragging || !this.dragStarted) return;
    this.updatePosition(pointer.x, pointer.y);
  }

  private onPointerUp(): void {
    this.isDragging = false;
    this.isPointerDown = false;

    if (!this.isCompleted && this.pathProgress < 0.98) {
      this.triggerFailure();
    }
  }

  private onGlobalPointerUp(): void {
    if (this.isPointerDown && !this.isCompleted) {
      this.isDragging = false;
      this.isPointerDown = false;
      this.triggerFailure();
    }
  }

  private updatePosition(cursorX: number, cursorY: number): void {
    if (!this.container || this.isCompleted) return;

    // Use sequential validation - only allow moving to the next valid position
    const maxAdvancement = 0.03; // Allow advancing only 3% of the path at a time - forces sequential movement
    const nextValidProgress = this.pathManager.getNextValidProgress(
      cursorX, 
      cursorY, 
      this.pathProgress, 
      maxAdvancement, 
      this.config.tolerance
    );

    if (nextValidProgress !== null) {
      // Valid forward movement found
      this.clearFailureTimeout();

      this.pathProgress = nextValidProgress;
      const newPosition = this.pathManager.getPositionOnPath(this.pathProgress);
      this.container.setPosition(newPosition.x, newPosition.y);

      // Add pulse effect
      this.effectsManager.createPulseEffect(this.container, this.pathProgress);

      // Update progress visualization
      if (this.progressGraphics) {
        this.pathManager.drawProgressPath(this.progressGraphics, this.pathProgress);
      }

      // Check completion
      if (this.pathProgress >= 0.98) {
        this.triggerCompletion();
      }
    } else {
      // Check if we can allow small backward movement for correction
      const minAllowedProgress = Math.max(0, this.pathProgress - this.config.maxBackwardMovement);
      const currentPathPosition = this.pathManager.getPositionOnPath(this.pathProgress);
      const distanceToCurrentPosition = Phaser.Math.Distance.Between(
        cursorX,
        cursorY,
        currentPathPosition.x,
        currentPathPosition.y
      );

      // Allow staying near current position for small corrections
      if (distanceToCurrentPosition <= this.config.tolerance) {
        this.clearFailureTimeout();
        // Don't update progress, just stay at current position
      } else {
        // Check if we can move backward slightly for correction
        const samples = 20;
        let foundValidBackward = false;

        for (let i = 1; i <= samples; i++) {
          const backwardProgress = this.pathProgress - (i / samples) * this.config.maxBackwardMovement;
          if (backwardProgress >= minAllowedProgress) {
            if (this.pathManager.isPositionOnPath(cursorX, cursorY, backwardProgress, this.config.tolerance)) {
              this.clearFailureTimeout();
              this.pathProgress = backwardProgress;
              const newPosition = this.pathManager.getPositionOnPath(this.pathProgress);
              this.container.setPosition(newPosition.x, newPosition.y);
              
              // Update progress visualization
              if (this.progressGraphics) {
                this.pathManager.drawProgressPath(this.progressGraphics, this.pathProgress);
              }
              
              foundValidBackward = true;
              break;
            }
          }
        }

        if (!foundValidBackward) {
          // Cursor is off path and not near any valid position
          if (!this.failureTimeout && this.isPointerDown) {
            this.startFailureTimeout();
          }
        }
      }
    }
  }

  private startFailureTimeout(): void {
    this.failureTimeout = this.scene.time.delayedCall(this.config.failureTimeoutMs, () => {
      this.triggerFailure();
    });
  }

  private clearFailureTimeout(): void {
    if (this.failureTimeout) {
      this.failureTimeout.destroy();
      this.failureTimeout = null;
    }
  }

  private triggerCompletion(): void {
    if (this.isCompleted) return;

    this.isCompleted = true;
    this.clearFailureTimeout();

    if (this.container) {
      this.effectsManager.createCompletionEffect(this.container, () => {
        this.destroy();
        console.log('Drag button completed!');
      });
    }

    // Create success particles
    const endPoint = this.pathManager.getEndPoint();
    if (endPoint) {
      this.effectsManager.createSuccessParticles(endPoint);
    }

    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }

  private triggerFailure(): void {
    if (this.isCompleted) return;

    this.isCompleted = true;
    this.isDragging = false;
    this.isPointerDown = false;
    this.clearFailureTimeout();

    if (this.container && this.circleGraphics) {
      this.effectsManager.createFailureEffect(this.container, this.circleGraphics, () => {
        this.destroy();
        console.log('Drag button failed - cursor left path or click released');
      });
    } else {
      this.destroy();
    }

    if (this.onFailureCallback) {
      this.onFailureCallback();
    }
  }

  updateLayout(centerX: number, centerY: number, scaleFactor: number, pathConfig?: import('./PathManager').PathConfig): void {
    if (this.isCompleted) return;

    // Recreate path with new dimensions and maintain rotation
    const pathConfigWithRotation = pathConfig ? {
      ...pathConfig,
      rotation: (pathConfig.rotation || 0) + this.buttonRotation
    } : { type: 'curved_up' as any, size: 100, rotation: this.buttonRotation };

    this.pathManager.createPath(centerX, centerY, scaleFactor, pathConfigWithRotation);

    // Redraw path
    if (this.pathGraphics) {
      this.pathManager.drawPath(this.pathGraphics);
    }

    // Update button position and maintain rotation
    if (this.container) {
      const currentPosition = this.pathManager.getPositionOnPath(this.pathProgress);
      this.container.setPosition(currentPosition.x, currentPosition.y);
      this.container.setScale(scaleFactor);
      this.container.setRotation(this.buttonRotation); // Maintain rotation
    }
  }

  destroy(): void {
    this.clearFailureTimeout();
    
    // Remove event listeners
    if (this.container) {
      this.container.removeAllListeners();
    }
    
    this.scene.input.off('pointerup', this.onGlobalPointerUp, this);
    this.scene.input.off('pointerupoutside', this.onGlobalPointerUp, this);

    // Destroy visual elements
    this.container?.destroy();
    this.pathGraphics?.destroy();
    this.progressGraphics?.destroy();

    // Reset references
    this.container = null;
    this.circleGraphics = null;
    this.pathGraphics = null;
    this.progressGraphics = null;
  }

  reset(): void {
    this.destroy();
    this.isCompleted = false;
    this.isDragging = false;
    this.isPointerDown = false;
    this.dragStarted = false;
    this.pathProgress = 0;
  }

  setOnComplete(callback: () => void): void {
    this.onCompleteCallback = callback;
  }

  setOnFailure(callback: () => void): void {
    this.onFailureCallback = callback;
  }

  isButtonCompleted(): boolean {
    return this.isCompleted;
  }
}

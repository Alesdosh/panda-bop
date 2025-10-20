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

  create(centerX: number, centerY: number, scaleFactor: number = 1, pathConfig?: import('./PathManager').PathConfig): void {
    if (this.isCompleted) return;

    // Create path
    this.pathManager.createPath(centerX, centerY, scaleFactor, pathConfig);

    // Create graphics
    this.pathGraphics = this.scene.add.graphics();
    this.progressGraphics = this.scene.add.graphics();
    this.pathManager.drawPath(this.pathGraphics);

    // Create draggable circle container
    const startPoint = this.pathManager.getStartPoint();
    if (!startPoint) return;

    this.container = this.scene.add.container(startPoint.x, startPoint.y);

    // Create the circle graphics
    this.circleGraphics = this.scene.add.graphics();
    this.drawCircle();

    this.container.add(this.circleGraphics);

    // Make it interactive
    this.container.setSize(70, 70);
    this.container.setInteractive({ draggable: true });

    // Add event listeners
    this.setupEventListeners();
  }

  private drawCircle(): void {
    if (!this.circleGraphics) return;

    this.circleGraphics.clear();
    this.circleGraphics.fillStyle(0x4a90e2);
    this.circleGraphics.fillCircle(0, 0, 25);
    this.circleGraphics.lineStyle(3, 0xffffff);
    this.circleGraphics.strokeCircle(0, 0, 25);

    // Add glow effect
    this.circleGraphics.lineStyle(6, 0x4a90e2, 0.3);
    this.circleGraphics.strokeCircle(0, 0, 35);
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

    const targetProgress = this.pathManager.getProgressFromPosition(cursorX, cursorY);
    const minAllowedProgress = Math.max(0, this.pathProgress - this.config.maxBackwardMovement);

    const pathPosition = this.pathManager.getPositionOnPath(targetProgress);
    const distanceToPath = Phaser.Math.Distance.Between(
      cursorX,
      cursorY,
      pathPosition.x,
      pathPosition.y
    );

    if (targetProgress >= minAllowedProgress && distanceToPath <= this.config.tolerance) {
      // Cursor is on path and moving forward
      this.clearFailureTimeout();

      this.pathProgress = targetProgress;
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
      // Cursor is off path
      if (!this.failureTimeout && this.isPointerDown) {
        this.startFailureTimeout();
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

    // Recreate path with new dimensions
    this.pathManager.createPath(centerX, centerY, scaleFactor, pathConfig);

    // Redraw path
    if (this.pathGraphics) {
      this.pathManager.drawPath(this.pathGraphics);
    }

    // Update button position
    if (this.container) {
      const currentPosition = this.pathManager.getPositionOnPath(this.pathProgress);
      this.container.setPosition(currentPosition.x, currentPosition.y);
      this.container.setScale(scaleFactor);
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

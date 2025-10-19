import { Scene } from 'phaser';
import * as Phaser from 'phaser';
//import { IncrementResponse, DecrementResponse, InitResponse } from '../../../shared/types/api';

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;
  count: number = 0;
  countText: Phaser.GameObjects.Text;
  incButton: Phaser.GameObjects.Text;
  decButton: Phaser.GameObjects.Text;
  goButton: Phaser.GameObjects.Text;

  // Draggable circle button elements
  dragButton: Phaser.GameObjects.Container;
  dragCircle: Phaser.GameObjects.Graphics;
  pathGraphics: Phaser.GameObjects.Graphics;
  progressGraphics: Phaser.GameObjects.Graphics;
  isDragging: boolean = false;
  pathPoints: Phaser.Math.Vector2[] = [];
  currentPathIndex: number = 0;
  dragStarted: boolean = false;
  buttonCompleted: boolean = false;

  // New properties for smooth dragging
  pathProgress: number = 0; // Progress along the entire path (0 to 1)
  totalPathLength: number = 0;
  pathSegmentLengths: number[] = [];
  pathSegmentStarts: number[] = [];

  // Properties for failure detection
  isPointerDown: boolean = false;
  failureTimeout: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super('Game');
  }

  create() {
    // Configure camera & background
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x222222);

    // Optional: semi-transparent background image if one has been loaded elsewhere
    this.background = this.add.image(512, 384, 'background').setAlpha(0.25);

    /* -------------------------------------------
     *  UI Elements
     * ------------------------------------------- */

    // Create the draggable circle button
    this.createDragButton();

    // Setup responsive layout
    this.updateLayout(this.scale.width, this.scale.height);
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      const { width, height } = gameSize;
      this.updateLayout(width, height);
    });

    // No automatic navigation to GameOver – users can stay in this scene.
  }

  createDragButton() {
    if (this.buttonCompleted) return;

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Define the predefined path points (curved path like in the image)
    this.pathPoints = [
      new Phaser.Math.Vector2(centerX - 100, centerY + 100), // Start point
      new Phaser.Math.Vector2(centerX - 80, centerY + 60),
      new Phaser.Math.Vector2(centerX - 40, centerY + 20),
      new Phaser.Math.Vector2(centerX, centerY - 20),
      new Phaser.Math.Vector2(centerX + 40, centerY - 60),
      new Phaser.Math.Vector2(centerX + 80, centerY - 100),
      new Phaser.Math.Vector2(centerX + 100, centerY - 140), // End point
    ];

    // Calculate path segment lengths for smooth movement
    this.calculatePathLengths();

    // Create path graphics
    this.pathGraphics = this.add.graphics();
    this.progressGraphics = this.add.graphics();
    this.drawPath();

    // Create draggable circle container
    const startPoint = this.pathPoints[0];
    if (!startPoint) return;

    this.dragButton = this.add.container(startPoint.x, startPoint.y);

    // Create the circle graphics
    this.dragCircle = this.add.graphics();
    this.dragCircle.fillStyle(0x4a90e2);
    this.dragCircle.fillCircle(0, 0, 25);
    this.dragCircle.lineStyle(3, 0xffffff);
    this.dragCircle.strokeCircle(0, 0, 25);

    // Add glow effect
    this.dragCircle.lineStyle(6, 0x4a90e2, 0.3);
    this.dragCircle.strokeCircle(0, 0, 35);

    this.dragButton.add(this.dragCircle);

    // Make it interactive
    this.dragButton.setSize(70, 70);
    this.dragButton.setInteractive({ draggable: true });

    // Add drag events
    this.dragButton.on('dragstart', this.onDragStart, this);
    this.dragButton.on('drag', this.onDrag, this);
    this.dragButton.on('dragend', this.onDragEnd, this);

    // Add pointer events for better mobile support
    this.dragButton.on('pointerdown', this.onPointerDown, this);
    this.dragButton.on('pointermove', this.onPointerMove, this);
    this.dragButton.on('pointerup', this.onPointerUp, this);

    // Add global pointer events to detect when pointer leaves the game area
    this.input.on('pointerup', this.onGlobalPointerUp, this);
    this.input.on('pointerupoutside', this.onGlobalPointerUp, this);
  }

  calculatePathLengths() {
    this.pathSegmentLengths = [];
    this.pathSegmentStarts = [];
    this.totalPathLength = 0;

    for (let i = 0; i < this.pathPoints.length - 1; i++) {
      const point1 = this.pathPoints[i];
      const point2 = this.pathPoints[i + 1];

      if (point1 && point2) {
        const segmentLength = Phaser.Math.Distance.Between(point1.x, point1.y, point2.x, point2.y);
        this.pathSegmentLengths.push(segmentLength);
        this.pathSegmentStarts.push(this.totalPathLength);
        this.totalPathLength += segmentLength;
      }
    }
  }

  getPositionOnPath(progress: number): Phaser.Math.Vector2 {
    // Clamp progress between 0 and 1
    progress = Phaser.Math.Clamp(progress, 0, 1);

    const targetDistance = progress * this.totalPathLength;

    // Find which segment we're on
    for (let i = 0; i < this.pathSegmentStarts.length; i++) {
      const segmentStart = this.pathSegmentStarts[i];
      const segmentLength = this.pathSegmentLengths[i];

      if (
        segmentStart !== undefined &&
        segmentLength !== undefined &&
        targetDistance >= segmentStart &&
        targetDistance <= segmentStart + segmentLength
      ) {
        // We're on this segment
        const segmentProgress = (targetDistance - segmentStart) / segmentLength;
        const point1 = this.pathPoints[i];
        const point2 = this.pathPoints[i + 1];

        if (point1 && point2) {
          // Interpolate between the two points
          const x = Phaser.Math.Linear(point1.x, point2.x, segmentProgress);
          const y = Phaser.Math.Linear(point1.y, point2.y, segmentProgress);
          return new Phaser.Math.Vector2(x, y);
        }
      }
    }

    // Fallback to start or end point
    const fallbackPoint =
      progress < 0.5 ? this.pathPoints[0] : this.pathPoints[this.pathPoints.length - 1];
    return fallbackPoint || new Phaser.Math.Vector2(0, 0);
  }

  getProgressFromPosition(x: number, y: number): number {
    let closestProgress = 0;
    let closestDistance = Infinity;

    // Check multiple points along the path to find the closest one
    const samples = 100;
    for (let i = 0; i <= samples; i++) {
      const progress = i / samples;
      const pathPos = this.getPositionOnPath(progress);
      const distance = Phaser.Math.Distance.Between(x, y, pathPos.x, pathPos.y);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestProgress = progress;
      }
    }

    return closestProgress;
  }

  drawPath() {
    if (!this.pathGraphics || this.pathPoints.length === 0) return;

    this.pathGraphics.clear();
    this.pathGraphics.lineStyle(4, 0x666666, 0.8);

    // Draw the curved path
    const startPoint = this.pathPoints[0];
    if (!startPoint) return;

    this.pathGraphics.beginPath();
    this.pathGraphics.moveTo(startPoint.x, startPoint.y);

    for (let i = 1; i < this.pathPoints.length; i++) {
      const point = this.pathPoints[i];
      if (point) {
        this.pathGraphics.lineTo(point.x, point.y);
      }
    }

    this.pathGraphics.strokePath();

    // Draw start and end indicators
    this.pathGraphics.fillStyle(0x00ff00, 0.7);
    this.pathGraphics.fillCircle(startPoint.x, startPoint.y, 8);

    const endPoint = this.pathPoints[this.pathPoints.length - 1];
    if (endPoint) {
      this.pathGraphics.fillStyle(0xff0000, 0.7);
      this.pathGraphics.fillCircle(endPoint.x, endPoint.y, 8);
    }
  }

  drawProgressPath() {
    if (!this.progressGraphics || this.pathPoints.length === 0) return;

    this.progressGraphics.clear();

    if (this.pathProgress <= 0) return;

    // Draw the completed portion of the path in a different color
    this.progressGraphics.lineStyle(6, 0x4a90e2, 0.8);

    const startPoint = this.pathPoints[0];
    if (!startPoint) return;

    this.progressGraphics.beginPath();
    this.progressGraphics.moveTo(startPoint.x, startPoint.y);

    // Draw path up to current progress
    const samples = 50;
    for (let i = 1; i <= samples; i++) {
      const progress = (i / samples) * this.pathProgress;
      const point = this.getPositionOnPath(progress);
      this.progressGraphics.lineTo(point.x, point.y);
    }

    this.progressGraphics.strokePath();
  }

  onDragStart() {
    this.isDragging = true;
    this.dragStarted = true;
    this.pathProgress = 0;
    this.isPointerDown = true;
    this.clearFailureTimeout();
  }

  onDrag(_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
    if (!this.isDragging) return;
    this.updateCirclePosition(dragX, dragY);
  }

  onDragEnd() {
    this.isDragging = false;
    this.isPointerDown = false;

    // If drag ended and we haven't completed the path, trigger failure
    if (!this.buttonCompleted && this.pathProgress < 0.98) {
      this.triggerButtonFailure();
    }
  }

  onPointerDown() {
    this.isDragging = true;
    this.dragStarted = true;
    this.pathProgress = 0;
    this.isPointerDown = true;
    this.clearFailureTimeout();
  }

  onPointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.isDragging || !this.dragStarted) return;
    this.updateCirclePosition(pointer.x, pointer.y);
  }

  onPointerUp() {
    this.isDragging = false;
    this.isPointerDown = false;

    // If pointer up and we haven't completed the path, trigger failure
    if (!this.buttonCompleted && this.pathProgress < 0.98) {
      this.triggerButtonFailure();
    }
  }

  onGlobalPointerUp() {
    // Handle global pointer up events (including when pointer leaves game area)
    if (this.isPointerDown && !this.buttonCompleted) {
      this.isDragging = false;
      this.isPointerDown = false;
      this.triggerButtonFailure();
    }
  }

  updateCirclePosition(cursorX: number, cursorY: number) {
    if (!this.dragButton || this.buttonCompleted) return;

    // Get the closest progress on the path to the cursor position
    const targetProgress = this.getProgressFromPosition(cursorX, cursorY);

    // Only allow forward movement (or small backward movement for correction)
    const maxBackwardMovement = 0.05; // Allow 5% backward movement
    const minAllowedProgress = Math.max(0, this.pathProgress - maxBackwardMovement);

    // Check if cursor is close enough to the path
    const pathPosition = this.getPositionOnPath(targetProgress);
    const distanceToPath = Phaser.Math.Distance.Between(
      cursorX,
      cursorY,
      pathPosition.x,
      pathPosition.y
    );

    const tolerance = 60; // Tolerance for staying on path

    if (targetProgress >= minAllowedProgress && distanceToPath <= tolerance) {
      // Cursor is on path and moving forward - clear any failure timeout
      this.clearFailureTimeout();

      this.pathProgress = targetProgress;
      const newPosition = this.getPositionOnPath(this.pathProgress);
      this.dragButton.setPosition(newPosition.x, newPosition.y);

      // Add smooth scaling effect based on movement
      const scale = 1 + Math.sin(this.pathProgress * Math.PI * 4) * 0.1;
      this.dragButton.setScale(scale);

      // Update progress visualization
      this.drawProgressPath();

      // Check if we've completed the path
      if (this.pathProgress >= 0.98) {
        // 98% to account for floating point precision
        this.completeDragButton();
      }
    } else {
      // Cursor is off path - start failure timeout if not already started
      if (!this.failureTimeout && this.isPointerDown) {
        this.startFailureTimeout();
      }
    }
  }

  completeDragButton() {
    this.buttonCompleted = true;

    // Add completion effect
    if (this.dragButton) {
      this.tweens.add({
        targets: this.dragButton,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          // Remove the button and path
          this.dragButton?.destroy();
          this.pathGraphics?.destroy();
          this.progressGraphics?.destroy();

          // You can add any completion logic here
          console.log('Drag button completed!');
        },
      });
    }

    // Add success particles or effects
    this.createCompletionEffect();
  }

  createCompletionEffect() {
    const finalPoint = this.pathPoints[this.pathPoints.length - 1];
    if (!finalPoint) return;

    // Create success particles
    for (let i = 0; i < 10; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0xffff00);
      particle.fillCircle(0, 0, 3);
      particle.setPosition(finalPoint.x, finalPoint.y);

      this.tweens.add({
        targets: particle,
        x: finalPoint.x + Phaser.Math.Between(-100, 100),
        y: finalPoint.y + Phaser.Math.Between(-100, 100),
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }

  startFailureTimeout() {
    // Start a timeout - if cursor stays off path for too long, trigger failure
    this.failureTimeout = this.time.delayedCall(300, () => {
      this.triggerButtonFailure();
    });
  }

  clearFailureTimeout() {
    if (this.failureTimeout) {
      this.failureTimeout.destroy();
      this.failureTimeout = null;
    }
  }

  triggerButtonFailure() {
    if (this.buttonCompleted) return;

    this.buttonCompleted = true;
    this.isDragging = false;
    this.isPointerDown = false;
    this.clearFailureTimeout();

    // Create failure effect - red flash and shake
    if (this.dragButton) {
      // Flash red
      this.dragCircle?.clear();
      this.dragCircle?.fillStyle(0xff4444);
      this.dragCircle?.fillCircle(0, 0, 25);
      this.dragCircle?.lineStyle(3, 0xffffff);
      this.dragCircle?.strokeCircle(0, 0, 25);

      // Shake and fade out
      this.tweens.add({
        targets: this.dragButton,
        x: this.dragButton.x + Phaser.Math.Between(-10, 10),
        y: this.dragButton.y + Phaser.Math.Between(-10, 10),
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 400,
        ease: 'Power2',
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          // Remove the button and path
          this.dragButton?.destroy();
          this.pathGraphics?.destroy();
          this.progressGraphics?.destroy();

          // Reset for potential recreation
          this.resetButtonState();

          console.log('Drag button failed - cursor left path or click released');
        },
      });
    } else {
      // If no button, just clean up graphics
      this.pathGraphics?.destroy();
      this.progressGraphics?.destroy();
      this.resetButtonState();
    }
  }

  resetButtonState() {
    // Reset all state variables for potential button recreation
    this.buttonCompleted = false;
    this.isDragging = false;
    this.isPointerDown = false;
    this.dragStarted = false;
    this.pathProgress = 0;
    this.currentPathIndex = 0;
    this.pathPoints = [];
    this.pathSegmentLengths = [];
    this.pathSegmentStarts = [];
    this.totalPathLength = 0;
    this.clearFailureTimeout();

    // Recreate the button after a short delay
    this.time.delayedCall(1000, () => {
      this.createDragButton();
    });
  }

  updateLayout(width: number, height: number) {
    // Resize camera viewport to avoid black bars
    this.cameras.resize(width, height);

    // Center and scale background image to cover screen
    if (this.background) {
      this.background.setPosition(width / 2, height / 2);
      if (this.background.width && this.background.height) {
        const scale = Math.max(width / this.background.width, height / this.background.height);
        this.background.setScale(scale);
      }
    }

    // Calculate a scale factor relative to a 1024 × 768 reference resolution.
    // We only shrink on smaller screens – never enlarge above 1×.
    const scaleFactor = Math.min(Math.min(width / 1024, height / 768), 1);

    // Update drag button path if it exists and hasn't been completed
    if (!this.buttonCompleted && this.pathPoints.length > 0) {
      const centerX = width / 2;
      const centerY = height / 2;

      // Recalculate path points for new screen size
      this.pathPoints = [
        new Phaser.Math.Vector2(centerX - 100 * scaleFactor, centerY + 100 * scaleFactor),
        new Phaser.Math.Vector2(centerX - 80 * scaleFactor, centerY + 60 * scaleFactor),
        new Phaser.Math.Vector2(centerX - 40 * scaleFactor, centerY + 20 * scaleFactor),
        new Phaser.Math.Vector2(centerX, centerY - 20 * scaleFactor),
        new Phaser.Math.Vector2(centerX + 40 * scaleFactor, centerY - 60 * scaleFactor),
        new Phaser.Math.Vector2(centerX + 80 * scaleFactor, centerY - 100 * scaleFactor),
        new Phaser.Math.Vector2(centerX + 100 * scaleFactor, centerY - 140 * scaleFactor),
      ];

      // Recalculate path lengths with new points
      this.calculatePathLengths();

      if (this.pathGraphics) {
        this.drawPath();
      }

      if (this.dragButton) {
        // Update position based on current progress
        const currentPosition = this.getPositionOnPath(this.pathProgress);
        this.dragButton.setPosition(currentPosition.x, currentPosition.y);
        this.dragButton.setScale(scaleFactor);
      }
    }

    if (this.countText) {
      this.countText.setPosition(width / 2, height * 0.45);
      this.countText.setScale(scaleFactor);
    }

    if (this.incButton) {
      this.incButton.setPosition(width / 2, height * 0.55);
      this.incButton.setScale(scaleFactor);
    }

    if (this.decButton) {
      this.decButton.setPosition(width / 2, height * 0.65);
      this.decButton.setScale(scaleFactor);
    }

    if (this.goButton) {
      this.goButton.setPosition(width / 2, height * 0.75);
      this.goButton.setScale(scaleFactor);
    }
  }
}

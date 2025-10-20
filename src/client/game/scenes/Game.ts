import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { DragButtonManager, PathType } from '../components';
//import { IncrementResponse, DecrementResponse, InitResponse } from '../../../shared/types/api';
import { DragButtonExamples } from '../components/examples';

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;
  count: number = 0;
  countText: Phaser.GameObjects.Text;
  incButton: Phaser.GameObjects.Text;
  decButton: Phaser.GameObjects.Text;
  goButton: Phaser.GameObjects.Text;
  ejemplo: DragButtonExamples;

  // Component manager
  private dragButtonManager: DragButtonManager;

  constructor() {
    super('Game');
  }

  create() {
    // Configure camera & background
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x222222);

    // Optional: semi-transparent background image if one has been loaded elsewhere
    this.background = this.add.image(512, 384, 'background').setAlpha(0.25);

    // Initialize drag button manager
    this.initializeDragButtonManager();

    // Create drag buttons with different examples
    //this.createExampleButtons();

    this.ejemplo = new DragButtonExamples();

    const scaleFactor = this.calculateScaleFactor(300, 300);

    // Example 1: Individual buttons with different rotations
    this.dragButtonManager.createSimpleButtonDegrees(
      'zigzag_0',
      150,
      150,
      PathType.ZIGZAG,
      60,
      scaleFactor,
      0
    );
    this.dragButtonManager.createSimpleButtonDegrees(
      'zigzag_45',
      300,
      150,
      PathType.ZIGZAG,
      60,
      scaleFactor,
      45
    );
    this.dragButtonManager.createSimpleButtonDegrees(
      'zigzag_90',
      450,
      150,
      PathType.ZIGZAG,
      60,
      scaleFactor,
      90
    );

    // Example 2: Hearts with different orientations
    this.dragButtonManager.createSimpleButtonDegrees(
      'heart_0',
      150,
      300,
      PathType.HEART,
      60,
      scaleFactor,
      0
    );
    this.dragButtonManager.createSimpleButtonDegrees(
      'heart_180',
      300,
      300,
      PathType.HEART,
      60,
      scaleFactor,
      180
    );

    // Example 3: Circular arrangement with auto-rotation
    this.dragButtonManager.createButtonCircle(
      600,
      300, // center
      80, // radius
      6, // 6 buttons
      [PathType.SPIRAL, PathType.S_CURVE],
      40, // size
      scaleFactor,
      true // auto-rotate to face outward
    );

    // Setup responsive layout
    this.updateLayout(this.scale.width, this.scale.height);
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      const { width, height } = gameSize;
      this.updateLayout(width, height);
    });

    // No automatic navigation to GameOver – users can stay in this scene.
  }

  private initializeDragButtonManager(): void {
    this.dragButtonManager = new DragButtonManager(this, {
      defaultButtonConfig: {
        tolerance: 40, // Reduced tolerance - must be closer to path
        maxBackwardMovement: 0.02, // Reduced backward movement - less correction allowed
        failureTimeoutMs: 200, // Faster failure - less time off path
      },
      defaultAutoRecreate: true,
      defaultRecreateDelay: 1500,
    });
  }

  private createExampleButtons(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const scaleFactor = this.calculateScaleFactor(width, height);

    // Choose one of these example methods:

    // 1. Simple single button
    // this.createSingleButtonExample(width, height, scaleFactor);

    // 2. Basic grid layout
    this.createBasicGridExample(width, height, scaleFactor);

    // 3. Circular arrangement
    // this.createCircularExample(width, height, scaleFactor);

    // 4. Advanced custom buttons
    // this.createAdvancedExample(width, height, scaleFactor);
  }

  private createSingleButtonExample(width: number, height: number, scaleFactor: number): void {
    this.dragButtonManager.createSimpleButton(
      'center_button',
      width / 2,
      height / 2,
      PathType.HEART,
      120,
      scaleFactor
    );
  }

  private createBasicGridExample(width: number, height: number, scaleFactor: number): void {
    const pathTypes = [PathType.CURVED_UP, PathType.SPIRAL, PathType.ZIGZAG, PathType.CIRCLE];

    this.dragButtonManager.createButtonGrid(
      width * 0.25, // startX
      height * 0.25, // startY
      3, // cols
      3, // rows
      width * 0.25, // spacing
      pathTypes,
      80, // size
      scaleFactor
    );
  }

  private createCircularExample(width: number, height: number, scaleFactor: number): void {
    const pathTypes = [
      PathType.HEART,
      PathType.S_CURVE,
      PathType.STRAIGHT_LINE,
      PathType.CURVED_DOWN,
    ];

    this.dragButtonManager.createButtonCircle(
      width / 2, // centerX
      height / 2, // centerY
      150, // radius
      6, // count
      pathTypes,
      70, // size
      scaleFactor
    );
  }

  private createAdvancedExample(width: number, height: number, scaleFactor: number): void {
    this.dragButtonManager.createButtons(
      [
        {
          id: 'precision_spiral',
          position: { x: width * 0.3, y: height * 0.3 },
          pathConfig: {
            type: PathType.SPIRAL,
            size: 100,
            rotation: Math.PI / 6,
          },
          buttonConfig: {
            tolerance: 40,
            failureTimeoutMs: 200,
          },
          onComplete: () => console.log('🎯 Precision spiral completed!'),
          autoRecreate: false,
        },
        {
          id: 'forgiving_heart',
          position: { x: width * 0.7, y: height * 0.7 },
          pathConfig: {
            type: PathType.HEART,
            size: 120,
          },
          buttonConfig: {
            tolerance: 80,
            maxBackwardMovement: 0.1,
          },
          onComplete: () => console.log('💖 Heart completed!'),
        },
      ],
      scaleFactor
    );
  }

  // Alternative method: Create buttons one by one with simple API
  private createSimpleExamples(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const scaleFactor = this.calculateScaleFactor(width, height);

    // Very simple API for quick button creation
    this.dragButtonManager.createSimpleButton(
      'heart1',
      width * 0.2,
      height * 0.5,
      PathType.HEART,
      80,
      scaleFactor
    );
    this.dragButtonManager.createSimpleButton(
      'spiral1',
      width * 0.4,
      height * 0.5,
      PathType.SPIRAL,
      80,
      scaleFactor
    );
    this.dragButtonManager.createSimpleButton(
      'zigzag1',
      width * 0.6,
      height * 0.5,
      PathType.ZIGZAG,
      80,
      scaleFactor
    );
    this.dragButtonManager.createSimpleButton(
      'circle1',
      width * 0.8,
      height * 0.5,
      PathType.CIRCLE,
      80,
      scaleFactor
    );
  }

  // Alternative method: Create advanced custom buttons
  private createAdvancedExamples(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const scaleFactor = this.calculateScaleFactor(width, height);

    // Advanced configuration with custom settings
    this.dragButtonManager.createButtons(
      [
        {
          id: 'fast_spiral',
          position: { x: width * 0.3, y: height * 0.3 },
          pathConfig: {
            type: PathType.SPIRAL,
            size: 120,
            rotation: Math.PI / 4, // 45 degrees rotation
          },
          buttonConfig: {
            tolerance: 40, // Stricter tolerance
            failureTimeoutMs: 200, // Faster failure
          },
          onComplete: () => console.log('Fast spiral completed!'),
          onFailure: () => console.log('Fast spiral failed!'),
          autoRecreate: false, // Don't recreate on failure
        },
        {
          id: 'offset_heart',
          position: { x: width * 0.7, y: height * 0.7 },
          pathConfig: {
            type: PathType.HEART,
            size: 100,
            offsetX: 20,
            offsetY: -10,
          },
          buttonConfig: {
            tolerance: 80, // More forgiving
            maxBackwardMovement: 0.1, // Allow more backward movement
          },
          recreateDelay: 2000, // Longer delay before recreating
        },
      ],
      scaleFactor
    );
  }

  private onAllButtonsCheck(): void {
    if (this.dragButtonManager.areAllButtonsCompleted()) {
      console.log('🎉 All buttons completed! Level finished!');
      // Handle level completion
    } else {
      const completed = this.dragButtonManager.getCompletedButtonCount();
      const total = Object.keys(this.dragButtonManager.getButtonStates()).length;
      console.log(`Progress: ${completed}/${total} buttons completed`);
    }
  }

  private calculateScaleFactor(width: number, height: number): number {
    // Calculate a scale factor relative to a 1024 × 768 reference resolution.
    // We only shrink on smaller screens – never enlarge above 1×.
    return Math.min(Math.min(width / 1024, height / 768), 1);
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

    const scaleFactor = this.calculateScaleFactor(width, height);

    // Update all drag buttons layout
    if (this.dragButtonManager) {
      this.dragButtonManager.updateLayout(width, height, scaleFactor);
    }

    // Update other UI elements
    this.updateUIElements(width, height, scaleFactor);
  }

  private updateUIElements(width: number, height: number, scaleFactor: number): void {
    if (this.countText) {
      this.countText.setPosition(width / 2, height * 0.05);
      this.countText.setScale(scaleFactor);
    }

    if (this.incButton) {
      this.incButton.setPosition(width / 2, height * 0.9);
      this.incButton.setScale(scaleFactor);
    }

    if (this.decButton) {
      this.decButton.setPosition(width / 2, height * 0.95);
      this.decButton.setScale(scaleFactor);
    }

    if (this.goButton) {
      this.goButton.setPosition(width / 2, height * 0.85);
      this.goButton.setScale(scaleFactor);
    }
  }
}

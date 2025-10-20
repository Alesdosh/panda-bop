import * as Phaser from 'phaser';
import { DragButton, DragButtonConfig } from './DragButton';
import { PathManager, PathConfig, PathType } from './PathManager';
import { EffectsManager } from './EffectsManager';

export interface DragButtonDefinition {
  id: string;
  position: {
    x: number;
    y: number;
  };
  pathConfig: PathConfig;
  buttonConfig?: Partial<DragButtonConfig>;
  rotation?: number; // Rotation in radians for the entire button (path + circle)
  onComplete?: () => void;
  onFailure?: () => void;
  autoRecreate?: boolean;
  recreateDelay?: number;
}

export interface DragButtonManagerConfig {
  defaultButtonConfig?: Partial<DragButtonConfig>;
  defaultAutoRecreate?: boolean;
  defaultRecreateDelay?: number;
}

export class DragButtonManager {
  private scene: Phaser.Scene;
  private effectsManager: EffectsManager;
  private buttons: Map<string, DragButton> = new Map();
  private pathManagers: Map<string, PathManager> = new Map();
  private buttonDefinitions: Map<string, DragButtonDefinition> = new Map();
  private config: DragButtonManagerConfig;

  constructor(scene: Phaser.Scene, config?: DragButtonManagerConfig) {
    this.scene = scene;
    this.effectsManager = new EffectsManager(scene);
    this.config = {
      defaultButtonConfig: {
        tolerance: 60,
        maxBackwardMovement: 0.05,
        failureTimeoutMs: 300,
      },
      defaultAutoRecreate: true,
      defaultRecreateDelay: 1000,
      ...config,
    };
  }

  /**
   * Creates a single drag button with the specified configuration
   */
  createButton(definition: DragButtonDefinition, scaleFactor: number = 1): void {
    // Create path manager for this button
    const pathManager = new PathManager();
    this.pathManagers.set(definition.id, pathManager);

    // Merge button config with defaults
    const buttonConfig: DragButtonConfig = {
      ...this.config.defaultButtonConfig,
      ...definition.buttonConfig,
    } as DragButtonConfig;

    // Create drag button
    const dragButton = new DragButton(this.scene, pathManager, this.effectsManager, buttonConfig);

    // Setup callbacks
    dragButton.setOnComplete(() => {
      this.handleButtonComplete(definition.id);
      if (definition.onComplete) {
        definition.onComplete();
      }
    });

    dragButton.setOnFailure(() => {
      this.handleButtonFailure(definition.id);
      if (definition.onFailure) {
        definition.onFailure();
      }
    });

    // Store button and definition
    this.buttons.set(definition.id, dragButton);
    this.buttonDefinitions.set(definition.id, definition);

    // Create the button
    dragButton.create(
      definition.position.x,
      definition.position.y,
      scaleFactor,
      definition.pathConfig,
      definition.rotation || 0
    );
  }

  /**
   * Creates multiple drag buttons at once
   */
  createButtons(definitions: DragButtonDefinition[], scaleFactor: number = 1): void {
    definitions.forEach((definition) => {
      this.createButton(definition, scaleFactor);
    });
  }

  /**
   * Creates a simple button with predefined configurations
   */
  createSimpleButton(
    id: string,
    x: number,
    y: number,
    pathType: PathType,
    size: number = 100,
    scaleFactor: number = 1,
    rotation: number = 0
  ): void {
    const definition: DragButtonDefinition = {
      id,
      position: { x, y },
      pathConfig: {
        type: pathType,
        size,
      },
      rotation,
    };

    this.createButton(definition, scaleFactor);
  }

  /**
   * Creates a simple button with rotation in degrees (convenience method)
   */
  createSimpleButtonDegrees(
    id: string,
    x: number,
    y: number,
    pathType: PathType,
    size: number = 100,
    scaleFactor: number = 1,
    rotationDegrees: number = 0
  ): void {
    const rotationRadians = (rotationDegrees * Math.PI) / 180;
    this.createSimpleButton(id, x, y, pathType, size, scaleFactor, rotationRadians);
  }

  /**
   * Creates multiple simple buttons in a grid layout
   */
  createButtonGrid(
    startX: number,
    startY: number,
    cols: number,
    rows: number,
    spacing: number,
    pathTypes: PathType[],
    size: number = 80,
    scaleFactor: number = 1,
    rotations?: number[] // Optional array of rotations for each button
  ): void {
    let pathTypeIndex = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * spacing;
        const y = startY + row * spacing;
        const pathType = pathTypes[pathTypeIndex % pathTypes.length];
        const rotation = rotations ? rotations[pathTypeIndex % rotations.length] : 0;
        const id = `grid_${row}_${col}`;

        if (pathType) {
          this.createSimpleButton(id, x, y, pathType, size, scaleFactor, rotation);
        }
        pathTypeIndex++;
      }
    }
  }

  /**
   * Creates buttons in a circular arrangement
   */
  createButtonCircle(
    centerX: number,
    centerY: number,
    radius: number,
    count: number,
    pathTypes: PathType[],
    size: number = 80,
    scaleFactor: number = 1,
    autoRotate: boolean = true // Automatically rotate each button to face outward
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const pathType = pathTypes[i % pathTypes.length];
      const rotation = autoRotate ? angle : 0; // Rotate to face outward from center
      const id = `circle_${i}`;

      if (pathType) {
        this.createSimpleButton(id, x, y, pathType, size, scaleFactor, rotation);
      }
    }
  }

  private handleButtonComplete(buttonId: string): void {
    console.log(`Button ${buttonId} completed!`);

    // Remove completed button
    this.removeButton(buttonId);
  }

  private handleButtonFailure(buttonId: string): void {
    console.log(`Button ${buttonId} failed!`);

    const definition = this.buttonDefinitions.get(buttonId);
    if (!definition) return;

    const autoRecreate = definition.autoRecreate ?? this.config.defaultAutoRecreate;
    const recreateDelay = definition.recreateDelay ?? this.config.defaultRecreateDelay;

    if (autoRecreate) {
      // Recreate after delay
      this.scene.time.delayedCall(recreateDelay || 1000, () => {
        if (!this.buttons.has(buttonId)) {
          this.createButton(definition);
        }
      });
    } else {
      // Just remove the button
      this.removeButton(buttonId);
    }
  }

  /**
   * Removes a specific button
   */
  removeButton(buttonId: string): void {
    const button = this.buttons.get(buttonId);
    if (button) {
      button.destroy();
      this.buttons.delete(buttonId);
    }

    const pathManager = this.pathManagers.get(buttonId);
    if (pathManager) {
      this.pathManagers.delete(buttonId);
    }

    this.buttonDefinitions.delete(buttonId);
  }

  /**
   * Removes all buttons
   */
  removeAllButtons(): void {
    this.buttons.forEach((button) => button.destroy());
    this.buttons.clear();
    this.pathManagers.clear();
    this.buttonDefinitions.clear();
  }

  /**
   * Updates layout for all buttons when screen size changes
   */
  updateLayout(_width: number, _height: number, scaleFactor: number): void {
    this.buttonDefinitions.forEach((definition, buttonId) => {
      const button = this.buttons.get(buttonId);
      if (button && !button.isButtonCompleted()) {
        // Recalculate position based on screen size if needed
        // For now, we'll just update with the same relative position
        button.updateLayout(definition.position.x, definition.position.y, scaleFactor, definition.pathConfig);
      }
    });
  }

  /**
   * Gets the current state of all buttons
   */
  getButtonStates(): { [buttonId: string]: { completed: boolean; active: boolean } } {
    const states: { [buttonId: string]: { completed: boolean; active: boolean } } = {};

    this.buttonDefinitions.forEach((_, buttonId) => {
      const button = this.buttons.get(buttonId);
      states[buttonId] = {
        completed: button ? button.isButtonCompleted() : false,
        active: button !== undefined,
      };
    });

    return states;
  }

  /**
   * Checks if all buttons are completed
   */
  areAllButtonsCompleted(): boolean {
    const states = this.getButtonStates();
    return Object.values(states).every((state) => state.completed);
  }

  /**
   * Gets count of active buttons
   */
  getActiveButtonCount(): number {
    return this.buttons.size;
  }

  /**
   * Gets count of completed buttons
   */
  getCompletedButtonCount(): number {
    const states = this.getButtonStates();
    return Object.values(states).filter((state) => state.completed).length;
  }
}

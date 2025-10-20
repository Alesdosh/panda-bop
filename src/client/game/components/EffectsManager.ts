import * as Phaser from 'phaser';

export class EffectsManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createSuccessParticles(position: Phaser.Math.Vector2): void {
    // Create success particles
    for (let i = 0; i < 10; i++) {
      const particle = this.scene.add.graphics();
      particle.fillStyle(0xffff00);
      particle.fillCircle(0, 0, 3);
      particle.setPosition(position.x, position.y);

      this.scene.tweens.add({
        targets: particle,
        x: position.x + Phaser.Math.Between(-100, 100),
        y: position.y + Phaser.Math.Between(-100, 100),
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }

  createCompletionEffect(
    target: Phaser.GameObjects.Container,
    onComplete?: () => void
  ): void {
    this.scene.tweens.add({
      targets: target,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        if (onComplete) {
          onComplete();
        }
      },
    });
  }

  createFailureEffect(
    target: Phaser.GameObjects.Container,
    circleGraphics: Phaser.GameObjects.Graphics,
    onComplete?: () => void
  ): void {
    // Flash red
    circleGraphics.clear();
    circleGraphics.fillStyle(0xff4444);
    circleGraphics.fillCircle(0, 0, 25);
    circleGraphics.lineStyle(3, 0xffffff);
    circleGraphics.strokeCircle(0, 0, 25);

    // Shake and fade out
    this.scene.tweens.add({
      targets: target,
      x: target.x + Phaser.Math.Between(-10, 10),
      y: target.y + Phaser.Math.Between(-10, 10),
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 400,
      ease: 'Power2',
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        if (onComplete) {
          onComplete();
        }
      },
    });
  }

  createPulseEffect(target: Phaser.GameObjects.Container, progress: number): void {
    const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
    target.setScale(scale);
  }
}

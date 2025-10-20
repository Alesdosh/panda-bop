import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
  background: GameObjects.Image | null = null;
  logo: GameObjects.Image | null = null;
  title: GameObjects.Text | null = null;
  empezar: GameObjects.Text;

  constructor() {
    super('MainMenu');
  }

  init(): void {
    this.background = null;
    this.logo = null;
    this.title = null;
  }

  create() {
    this.refreshLayout();

    // Funcion para crear boton

    const createButton = (y: number, label: string, color: string, onClick: () => void) => {
          const button = this.add
            .text(600, y, label, {
              fontFamily: 'Arial Black',
              fontSize: 36,
              color: color,
              backgroundColor: '#444444',
              padding: {
                x: 25,
                y: 12,
              } as Phaser.Types.GameObjects.Text.TextPadding,
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => button.setStyle({ backgroundColor: '#555555' }))
            .on('pointerout', () => button.setStyle({ backgroundColor: '#444444' }))
            .on('pointerdown', onClick);
          return button;
        }; 

    this.empezar = createButton(this.scale.height * 0.6, 'Empezar', '#00ff00', () => {
      this.scene.start('Game');
    });

    // Re-calculate positions whenever the game canvas is resized (e.g. orientation change).
    this.scale.on('resize', () => this.refreshLayout());

  }

  // Funcion para escalar los elementos graficos del main menu
  private refreshLayout(): void {
    const { width, height } = this.scale;

    // Resize camera to new viewport to prevent black bars
    this.cameras.resize(width, height);

    // Background – stretch to fill the whole canvas
    if (!this.background) {
      this.background = this.add.image(0, 0, 'background').setOrigin(0);
    }
    this.background!.setDisplaySize(width, height);

    // Logo – keep aspect but scale down for very small screens
    const scaleFactor = Math.min(width / 1024, height / 768);

    if (!this.logo) {
      this.logo = this.add.image(100, 100, 'logo');
    }
    this.logo!.setPosition(width / 2, height * 0.38).setScale(scaleFactor);

    // Title text – create once, then scale on resize
    const baseFontSize = 38;
    if (!this.title) {
      this.title = this.add
        .text(0, 0, 'Menu Principal', {
          fontFamily: 'Arial Black',
          fontSize: `${baseFontSize}px`,
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 8,
          align: 'center',
        })
        .setOrigin(0.5);
    }
    this.title!.setPosition(width / 2, height * 0.6);
    this.title!.setScale(scaleFactor);
  }
}

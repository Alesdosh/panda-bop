import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
  background: GameObjects.Image | null = null;
  logo: GameObjects.Image | null = null;
  title: GameObjects.Text | null = null;
  empezar: GameObjects.Text;
  p: GameObjects.Image | null = null;
  a: GameObjects.Image | null = null;
  n: GameObjects.Image | null = null;
  d: GameObjects.Image | null = null;
  b: GameObjects.Image | null = null;
  o: GameObjects.Image | null = null;
  s1: GameObjects.Image | null = null;
  s2: GameObjects.Image | null = null;

  constructor() {
    super('MainMenu');
  }

  init(): void {
    this.background = null;
    this.logo = null;
    this.title = null;
    this.p = null;
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

    if(!this.s1){
      this.s1 = this.add.image(30, 100, '!').setScale(0.5)
    }

    if(!this.p){
      this.p = this.add.image(100, 100, 'p').setScale(0.5)
      this.p = this.add.image(900, 100, 'p').setScale(0.5)
    }

     if(!this.a){
      this.a = this.add.image(200, 100, 'a').setScale(0.5)
      this.a = this.add.image(500, 100, 'a').setScale(0.5)
    }

     if(!this.n){
      this.n = this.add.image(300, 100, 'n').setScale(0.5)
    }

     if(!this.d){
      this.d = this.add.image(400, 100, 'd').setScale(0.5)
    }

     if(!this.b){
      this.b = this.add.image(700, 100, 'b').setScale(0.5)
    }

    if(!this.o){
      this.o = this.add.image(800, 100, 'o').setScale(0.5)
    }

    if(!this.s2){
      this.s2 = this.add.image(990, 100, '¡').setScale(0.5)
    }

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

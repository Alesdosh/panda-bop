import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    this.add.image(512, 384, 'background');

    // Barra de progreso
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    this.load.on('progress', (progress: number) => {
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    //  Cargar los assets para el juego
    this.load.setPath('assets');

    this.load.image('logo', 'logo.png');
  }

  create() {
    //  Aqui se pueden crear Objetos globales

    // Moverse al main menu
    this.scene.start('MainMenu');
  }
}

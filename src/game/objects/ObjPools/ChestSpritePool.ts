import Phaser from 'phaser';

export class ChestSpritePool {
  private readonly scene: Phaser.Scene;
  private readonly pool: Phaser.GameObjects.Sprite[] = [];
  private readonly textureKey: string;
  private readonly frame?: string | number;

  constructor(
    scene: Phaser.Scene,
    textureKey: string,
    initialCount = 900,
    frame?: string | number
  ) {
    this.scene = scene;
    this.textureKey = textureKey;
    this.frame = frame;

    for (let i = 0; i < initialCount; i++) {
      this.pool.push(this.createSprite());
    }
  }

  public acquire(x: number, y: number, frame?: string | number): Phaser.GameObjects.Sprite {
    let chest = this.pool.find((item) => !item.active);

    if (!chest) {
      chest = this.createSprite();
      this.pool.push(chest);
    }

    chest.setPosition(x, y);
    chest.setTexture(this.textureKey, frame ?? this.frame);
    chest.setActive(true);
    chest.setVisible(true);

    return chest;
  }

  /**
   * Nhả sprite rương về pool
   */
  public release(chest: Phaser.GameObjects.Sprite): void {
    chest.stop();
    chest.removeAllListeners();
    chest.disableInteractive();
    chest.setActive(false);
    chest.setVisible(false);
  }

  private createSprite(): Phaser.GameObjects.Sprite {
    const sprite = this.scene.add.sprite(0, 0, this.textureKey, this.frame);
    sprite.setDepth(16);
    sprite.setActive(false);
    sprite.setVisible(false);
    return sprite;
  }
}
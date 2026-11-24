import { GameObjects } from 'phaser';
import { HealthBar } from './Healthbar';


export interface PlayerViewState {
  x: number;
  y: number;
  hp: number;
  maxHp?: number;
  facingLeft?: boolean;
}

export class Player extends GameObjects.Container {
  public sprite: GameObjects.Sprite;
  public healthBar: HealthBar;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    maxHp = 100,
    textureKey = 'player'
  ) {
    super(scene, x, y);

    this.sprite = scene.add.sprite(0, 0, textureKey);
    this.healthBar = new HealthBar(scene, 0, -20, 24, 5, maxHp);

    this.add([this.sprite, this.healthBar]);
    scene.add.existing(this);
  }
}
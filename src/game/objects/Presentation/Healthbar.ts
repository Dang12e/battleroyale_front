import {GameObjects, Math as PhaserMath } from 'phaser';
export class HealthBar extends GameObjects.Container {
  private bar: Phaser.GameObjects.Graphics;
  private barWidth: number;
  private barHeight: number;
  private value: number;
  private maxValue: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    barHeight: number,
    maxValue: number
  ) {
    super(scene, x, y);
    this.barWidth = width;
    this.barHeight = barHeight;
    this.maxValue = maxValue;
    this.value = maxValue;

    this.bar = new GameObjects.Graphics(scene);
    this.add(this.bar);
    this.draw();

  }

  public setHealth(newValue: number): void {
    this.value = PhaserMath.Clamp(newValue, 0, this.maxValue);
    this.draw();
  }

  private draw(): void {
    this.bar.clear();

    // 1. Viền và nền đen (căn giữa theo trục X để dễ gắn trên đầu nhân vật)
    const offsetX = -this.barWidth / 2;
    this.bar.fillStyle(0x000000, 0.8);
    this.bar.fillRect(offsetX - 1, -1, this.barWidth + 2, this.barHeight + 2);

    // 2. Phần máu hiện tại
    const percent = this.value / this.maxValue;
    const currentbarWidth = Math.floor(this.barWidth * percent);

    // Đổi màu theo lượng máu
    const color = percent > 0.5 ? 0x00ff00 : percent > 0.25 ? 0xffaa00 : 0xff0000;
    this.bar.fillStyle(color, 1);
    this.bar.fillRect(offsetX, 0, currentbarWidth, this.barHeight);
  }
}
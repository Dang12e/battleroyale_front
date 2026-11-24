import { GridPos } from "./GridData";

export class RangeOverlay {
  private graphics: Phaser.GameObjects.Graphics;
  private tileSize: number;

  constructor(scene: Phaser.Scene, tileSize: number, depth = 15) {
    this.tileSize = tileSize;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(depth);
  }

  // Vẽ danh sách các ô
  public drawTiles(
    tiles: GridPos[],
    fillColor = 0x3b82f6, // Xanh dương cho tầm di chuyển
    fillAlpha = 0.35,
    strokeColor = 0x60a5fa,
    strokeAlpha = 0.8
  ): void {
    this.clear();

    this.graphics.fillStyle(fillColor, fillAlpha);
    this.graphics.lineStyle(2, strokeColor, strokeAlpha);

    const padding = 2; // Tạo khe hở nhỏ giữa các ô cho đẹp
    const size = this.tileSize - padding * 2;

    for (const tile of tiles) {
      const worldX = tile.x * this.tileSize + padding;
      const worldY = tile.y * this.tileSize + padding;

      // Vẽ nền ô và viền ô (có thể dùng fillRoundedRect để bo góc nhẹ)
      this.graphics.fillRoundedRect(worldX, worldY, size, size, 4);
      this.graphics.strokeRoundedRect(worldX, worldY, size, size, 4);
    }
  }

  public clear(): void {
    this.graphics.clear();
  }
}
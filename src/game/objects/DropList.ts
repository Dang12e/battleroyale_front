import Phaser from "phaser";
import { ItemState } from "../../schemas/ItemState";

interface DropRowObject {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Rectangle;
  icon: Phaser.GameObjects.Image;
  text: Phaser.GameObjects.Text;
}

export class DropListView {
  private readonly scene: Phaser.Scene;
  private readonly root: Phaser.GameObjects.Container;
  private readonly panelBg: Phaser.GameObjects.Rectangle;
  private readonly rows: DropRowObject[] = [];
  private isOpen = false;

  private readonly x = 24;
  private readonly y = 100;
  private readonly rowHeight = 40;
  private readonly rowGap = 6;

  constructor(scene: Phaser.Scene, depth = 50, parent?: Phaser.GameObjects.Container) {
    this.scene = scene;
    this.root = this.scene.add
      .container(0, 0)
      .setDepth(depth)
      .setScrollFactor(0)
      .setVisible(false);
    parent?.add(this.root);

    this.panelBg = this.scene.add
      .rectangle(this.x - 8, this.y - 8, 220, 36, 0x11151c, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x3b4659, 1);

    this.root.add(this.panelBg);
  }

  public onEnter(gx: number, gy: number, items:Array<ItemState>): void {
    this.clearCreatedObjects();
    this.isOpen = true;

    if (items.length === 0) {
      const emptyLabel = this.scene.add.text(
        this.x + 4,
        this.y + 4,
        `Ô (${gx}, ${gy}) trống`,
        { fontSize: "14px", color: "#9aa5b4" }
      );
      this.panelBg.setSize(190, 32);
      this.root.add(emptyLabel);
      this.root.setVisible(true);
      return;
    }

    items.forEach((item, index) => {
      const rowY = this.y + index * (this.rowHeight + this.rowGap);
      const row = this.createRow(item, rowY);
      this.rows.push(row);
      this.root.add(row.container);
    });

    const panelHeight = items.length * (this.rowHeight + this.rowGap) + 10;
    this.panelBg.setSize(220, panelHeight);
    this.root.setVisible(true);
  }

  public onExit(): void {
    this.isOpen = false;
    this.clearCreatedObjects();
    this.root.setVisible(false);
    console.log("lootexit");
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }

  private createRow(item: ItemState, rowY: number): DropRowObject {
    const container = this.scene.add.container(this.x, rowY);

    const bg = this.scene.add
      .rectangle(0, 0, 204, this.rowHeight, 0x1e2530, 0.95)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x4b586e, 1);

    const icon = this.scene.add
      .image(20, this.rowHeight / 2, item.itemTypeId)
      .setDisplaySize(24, 24);

    const text = this.scene.add
      .text(40, this.rowHeight / 2, `${item.itemTypeId} durability:${item.durability}`, {
        fontSize: "14px",
        color: "#f8fafc",
      })
      .setOrigin(0, 0.5);

    container.add([bg, icon, text]);
    return { container, bg, icon, text };
  }

  private clearCreatedObjects(): void {
    this.root.getAll().forEach((child) => {
      if (child !== this.panelBg) {
        child.destroy();
      }
    });
    this.rows.length = 0;
  }
}
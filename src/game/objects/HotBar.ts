import * as Phaser from "phaser";
import { ItemState } from "../../schemas/ItemState";


// Tao HotBar o giua gom 5 o : o 1 la vu khi , o 2 la giap , o 3-4-5 la item

interface HotbarSlotUI {
  bg: Phaser.GameObjects.Rectangle;
  icon: Phaser.GameObjects.Image;
  keyLabel: Phaser.GameObjects.Text;
  subLabel: Phaser.GameObjects.Text; // Hiển thị tên loại (VK/Giáp) hoặc độ bền
}

export class HotBar {
  private readonly scene: Phaser.Scene;
  private readonly root: Phaser.GameObjects.Container;
  private readonly slotUIs: HotbarSlotUI[] = [];
  private readonly slots: (ItemState | null)[] = [null, null, null, null, null];
  private selectedIndex = 0;

  private readonly slotSize = 52;
  private readonly gap = 8;

  constructor(scene: Phaser.Scene, parent?: Phaser.GameObjects.Container) {
    this.scene = scene;

    // Tạo container đặt ở giữa dưới màn hình
    this.root = scene.add.container(0, 0).setDepth(50);
    parent?.add(this.root); // Gắn vào uiContainer để đi theo uiCamera

    this.buildSlots();
    this.updatePosition(scene.scale.width, scene.scale.height);

    // Tự căn lại giữa-dưới khi đổi kích thước cửa sổ
    const onResize = (gameSize: Phaser.Structs.Size) => {
      this.updatePosition(gameSize.width, gameSize.height);
    };
    scene.scale.on(Phaser.Scale.Events.RESIZE, onResize);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.scale.off(Phaser.Scale.Events.RESIZE, onResize);
    });
  }

  private buildSlots(): void {
    const totalWidth = 5 * this.slotSize + 4 * this.gap;
    const startX = -totalWidth / 2 + this.slotSize / 2;
    const titles = ["VK", "Giáp", "3", "4", "5"];

    for (let i = 0; i < 5; i++) {
      const x = startX + i * (this.slotSize + this.gap);

      const bg = this.scene.add
        .rectangle(x, 0, this.slotSize, this.slotSize, 0x11151c, 0.9)
        .setStrokeStyle(2, i === this.selectedIndex ? 0xfacc15 : 0x4b586e, 1)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => this.selectSlot(i));

      const icon = this.scene.add
        .image(x, -2, "")
        .setDisplaySize(28, 28)
        .setVisible(false);

      const keyLabel = this.scene.add
        .text(x - this.slotSize / 2 + 5, -this.slotSize / 2 + 4, titles[i], {
          fontSize: "11px",
          color: "#94a3b8",
        })
        .setOrigin(0, 0);

      const subLabel = this.scene.add
        .text(x, this.slotSize / 2 - 4, "", {
          fontSize: "10px",
          color: "#e2e8f0",
        })
        .setOrigin(0.5, 1);

      this.root.add([bg, icon, keyLabel, subLabel]);
      this.slotUIs.push({ bg, icon, keyLabel, subLabel });
    }
  }

  private updatePosition(screenWidth: number, screenHeight: number): void {
    this.root.setPosition(screenWidth / 2, screenHeight - 44);
  }

  public selectSlot(index: number): void {
    if (index < 0 || index >= 5) return;
    this.selectedIndex = index;
    this.render();
  }
 public render(): void {
    for (let i = 0; i < 5; i++) {
      const item = this.slots[i];
      const ui = this.slotUIs[i];

      // Tô viền vàng cho ô đang chọn
      ui.bg.setStrokeStyle(2, i === this.selectedIndex ? 0xfacc15 : 0x4b586e, 1);

      if (item) {
        ui.icon.setTexture(item.itemTypeId).setVisible(true);
        ui.subLabel.setText(`${item.durability}`);
      } else {
        ui.icon.setVisible(false);
        ui.subLabel.setText("");
      }
    }
}
}
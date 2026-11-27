
import { Cell } from "./Cell";
import { GridData } from "./GridData";
import {Scene,GameObjects,Scenes} from 'phaser';

export class GridHoverRenderer {
    private readonly scene: Scene;
    private readonly gridData: GridData;
    private readonly graphics: GameObjects.Graphics;
    private lastCell: Cell | null = null;

    constructor(scene: Phaser.Scene, gridData: GridData,parent: Phaser.GameObjects.Container) {
        this.scene = scene;
        this.gridData = gridData;
        this.graphics = scene.add.graphics();
        parent.add(this.graphics);
        this.graphics.setDepth(10);

        const cleanup = () => this.destroy();
        this.scene.events.once(Scenes.Events.SHUTDOWN, cleanup);
        this.scene.events.once(Scenes.Events.DESTROY, cleanup);
    }

    public updateHover(worldX: number, worldY: number): Cell | null {
        const hoveredCell = this.gridData.getCellAtWorld(worldX, worldY);

        // Skip redrawing if the pointer is still on the exact same cell
        if (hoveredCell === this.lastCell) {
            return hoveredCell;
        }

        this.lastCell = hoveredCell;
        this.graphics.clear();

        if (!hoveredCell) {
            return null;
        }

        const fillColor = 0xff4444;
        const strokeColor =0xff8888;

        this.graphics.fillStyle(fillColor, 0.2);
        this.graphics.fillRect(hoveredCell.x, hoveredCell.y, hoveredCell.size, hoveredCell.size);

        this.graphics.lineStyle(2, strokeColor, 0.9);
        this.graphics.strokeRect(hoveredCell.x, hoveredCell.y, hoveredCell.size, hoveredCell.size);

        return hoveredCell;
    }

    public clear(): void {
        this.lastCell = null;
        this.graphics.clear();
    }

    public destroy(): void {
        this.graphics.destroy();
    }
}
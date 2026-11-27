import {Scene,Tilemaps} from 'phaser';

export class TilemapHelper {
    constructor(private scene: Scene) {}

    // 1. Load JSON (ưu tiên lấy từ cache đã preload, nếu chưa có thì fetch theo path/url)
    async loadJsonGrid(keyOrUrl: string): Promise<number[][]> {
        const cached = this.scene.cache.json.get(keyOrUrl);
        if (cached) return cached as number[][];

        const res = await fetch(keyOrUrl);
        return (await res.json()) as number[][];
    }

    // 2. Tạo TilemapLayer từ mảng 2D index + spritesheet/image key
    createTileLayer(
        data: number[][],
        sheetKey: string,
        tileSize: number,
        depth = 0,
        scale = 1
    ): Tilemaps.TilemapLayer |Tilemaps.TilemapGPULayer | null {
        const map = this.scene.make.tilemap({
            data,
            tileWidth: tileSize,
            tileHeight: tileSize
        });

        const tileset = map.addTilesetImage(sheetKey, sheetKey, tileSize, tileSize);
        if (!tileset) return null;

        const layer = map.createLayer(0, tileset, 0, 0);
        layer?.setScale(scale);
        layer?.setDepth(depth);
        return layer;
    }
}
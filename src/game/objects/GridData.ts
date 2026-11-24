import { Cell } from "./Cell";

export interface GridDataConfig {
    offsetX?: number;
    offsetY?: number;
    width: number;     // number of columns
    height: number;    // number of rows
    cellSize: number;  // cell size in pixels
}

export class GridData {
    public readonly offsetX: number;
    public readonly offsetY: number;
    public readonly width: number;
    public readonly height: number;
    public readonly cellSize: number;
    private readonly cells: Cell[][];

    constructor(config: GridDataConfig) {
        if (config.width <= 0 || config.height <= 0) {
            throw new Error("GridData width and height must be greater than 0.");
        }
        if (config.cellSize <= 0) {
            throw new Error("GridData cellSize must be greater than 0.");
        }

        this.offsetX = config.offsetX ?? 0;
        this.offsetY = config.offsetY ?? 0;
        this.width = Math.floor(config.width);
        this.height = Math.floor(config.height);
        this.cellSize = config.cellSize;

        this.cells = this.createCells();
    }

    private createCells(): Cell[][] {
        const grid: Cell[][] = [];

        for (let row = 0; row < this.height; row++) {
            const rowCells: Cell[] = [];
            for (let col = 0; col < this.width; col++) {
                rowCells.push(
                    new Cell({
                        col,
                        row,
                        offsetX: this.offsetX,
                        offsetY: this.offsetY,
                        cellSize: this.cellSize,
                    })
                );
            }
            grid.push(rowCells);
        }

        return grid;
    }

    public get pixelWidth(): number {
        return this.width * this.cellSize;
    }

    public get pixelHeight(): number {
        return this.height * this.cellSize;
    }

    public isInside(col: number, row: number): boolean {
        return col >= 0 && col < this.width && row >= 0 && row < this.height;
    }

    public getCell(col: number, row: number): Cell | null {
        if (!this.isInside(col, row)) {
            return null;
        }
        return this.cells[row][col];
    }

    public getCellAtWorld(worldX: number, worldY: number): Cell | null {
        const col = Math.floor((worldX - this.offsetX) / this.cellSize);
        const row = Math.floor((worldY - this.offsetY) / this.cellSize);
        return this.getCell(col, row);
    }

    public getAllCells(): Cell[] {
        return this.cells.flat();
    }

    public forEachCell(callback: (cell: Cell) => void): void {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                callback(this.cells[row][col]);
            }
        }
    }
}
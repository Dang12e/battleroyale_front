import { ItemState } from "../../schemas/ItemState";
import { PlayerState } from "../../schemas/PlayerState";
import { ChestSpritePool } from "./ObjPools/ChestSpritePool";
import { Player } from "./Presentation/Player";

export interface CellConfig {
    col: number;
    row: number;
    offsetX: number;
    offsetY: number;
    cellSize: number;

}

export class Cell {
    public readonly col: number;
    public readonly row: number;
    public readonly x: number;      // world top-left X
    public readonly y: number;      // world top-left Y
    public readonly size: number;
    public hasChest:boolean;  
    public itemsList: Array<ItemState>=new Array<ItemState>();
    public player:Player | null=null; // cell size in pixels

    constructor(config: CellConfig) {
        this.col = config.col;
        this.row = config.row;
        this.size = config.cellSize;
        this.x = config.offsetX + config.col * config.cellSize;
        this.y = config.offsetY + config.row * config.cellSize;

    }

    public get centerX(): number {
        return this.x + this.size / 2;
    }

    public get centerY(): number {
        return this.y + this.size / 2;
    }

   

    public containsWorldPoint(worldX: number, worldY: number): boolean {
        return (
            worldX >= this.x &&
            worldX < this.x + this.size &&
            worldY >= this.y &&
            worldY < this.y + this.size
        );
    }
    public getChest(chestspritespool:ChestSpritePool)
    {
        if(!this.hasChest)
        {
            chestspritespool.acquire(this.centerX,this.centerY,0);
            this.hasChest=true;
        }
    }
    public pushItem(itemState:ItemState)
    {
     this.itemsList.push(itemState);
    }
    public removeItem(itemState:ItemState)
    {
        this.itemsList=this.itemsList.filter(item=>{item==itemState});
    }
    public removePlayer()
    {
        this.player=null;
    }
    public setPlayer(player:Player)
    {
        this.player=player;
    }
   
}
import { Client, Room } from "@colyseus/sdk";
import { BattleRoyale } from "../../scenes/BattleRoyale";
import { InputHandler } from "./InputHandler";
import { InputHandlerManager } from "./InputHandlerManager";


export class MoveInput extends InputHandler<BattleRoyale>
{
    private handlePointerDown?: (pointer: Phaser.Input.Pointer) => void;
    constructor(id:string,context: BattleRoyale,inputmanager:InputHandlerManager<BattleRoyale>

    )
    {
        super(id,context,inputmanager);
    }
    public onEnter(): void {
        const overlayer=this.context.rangeOverlay;
        const {x,y}={x:this.context.player.gridPos.x,y:this.context.player.gridPos.y}
        console.log(`player pos: ${x} ${y}`);
        overlayer.drawTiles(this.context.gridData.getMoveRange({x:x,y:y},2));
        const input=this.context.input;
        const room=this.context.room;
        this.handlePointerDown = () => {
            room.send("move", this.getTarget());
            this.inputHandlerManager.exitcurrentHandler();
        };

        //ve cac o co the di chuyen 
        input.on("pointerdown",this.handlePointerDown);
    }
    public onExit(): void {
        this.context.input.off("pointerdown",this.handlePointerDown);
        this.handlePointerDown=undefined;
        console.log("unbinded");
        this.context.rangeOverlay.clear();
    }
    

    private getTarget()
    {
        const cord=this.context.cameraController.getPointerWorldPosition();
        return this.context.gridData.getGridpos(cord.x,cord.y);
    }
    
    
}
export interface MoveData{

}
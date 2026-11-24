import { Client, Room } from "@colyseus/sdk";
import { BattleRoyale } from "../../scenes/BattleRoyale";
import { InputHandler } from "./InputHandler";
import { InputHandlerManager } from "./InputHandlerManager";
import { DefaultData } from "./DefaultInputHandler";

export class MoveInput extends InputHandler<BattleRoyale,MoveData>
{
    public onEnter(): void {
        const input=this.context.input;
        const room=this.context.room;

        //ve cac o co the di chuyen 
        input.on("pointerdown",()=>{
            room.send("move",this.getTarget());
            const defaultdata:DefaultData={};
            this.inputHandlerManager.exitcurrentHandler(defaultdata);
        })
    }
    public onExit(): void {
        this.context.input.on("pointerdown",()=>{});
    }

    private getTarget()
    {
        const cord=this.context.cameraController.getPointerWorldPosition();
        return {x:Math.floor(cord.x),y:Math.floor(cord.y)};
    }
    
    
}
export interface MoveData{

}
import { BattleRoyale } from "../../scenes/BattleRoyale";
import { InputHandler } from "./InputHandler";
import {InputHandlerManager } from "./InputHandlerManager";

export class DefaultInputHandler extends InputHandler<BattleRoyale,DefaultData>{
    public onEnter(): void {
       
    }
    public onExit(): void {
        
    }
    
    

}

export interface DefaultData{

}
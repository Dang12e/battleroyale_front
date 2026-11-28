import { BattleRoyale } from "../../scenes/BattleRoyale";
import { InputHandler } from "./InputHandler";

export class LootInput extends InputHandler<BattleRoyale>{
    public onEnter(): void {

        const playergridPos=this.context.player.gridPos;
        const items=this.context.gridData.getCell(playergridPos.x,playergridPos.y)?.itemsList;
        if(items)
        {
          this.context.dropList.onEnter(playergridPos.x,playergridPos.y,items);
        }
    }
    public onExit(): void {
        this.context.dropList.onExit();
    }

}
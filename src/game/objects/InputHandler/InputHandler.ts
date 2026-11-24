
import { InputHandlerManager } from "./InputHandlerManager";

export abstract class InputHandler<TContext>{
 constructor(public id:string,public context:TContext,public inputHandlerManager:InputHandlerManager<TContext> ){}

 public abstract onEnter():void;
 public abstract onExit():void;
 


}
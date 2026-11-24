
import { InputHandlerManager } from "./InputHandlerManager";

export abstract class InputHandler<TContext,TData>{
 constructor(public id:string,public context:TContext,public inputHandlerManager:InputHandlerManager<TContext> ){}

 public abstract onEnter(data:TData):void;
 public abstract onExit(data:TData):void;
 


}
import { DefaultInputHandler } from "./DefaultInputHandler";
import { InputHandler } from "./InputHandler";

export class InputHandlerManager<TContext>{
    constructor(
    private currentInputHandler:InputHandler<TContext,any>,
    private defaultInputHandler:InputHandler<TContext,any>)
    {}
    
    public changeInputHandler<TData>(newHandler:InputHandler<TContext,TData>,data:TData)
    {
        this.currentInputHandler?.onExit(data);
        this.currentInputHandler=newHandler;
        this.currentInputHandler.onEnter(data);
        
    }
    public exitcurrentHandler<TData>(data:TData)
    {
        if(this.currentInputHandler!=this.defaultInputHandler)
        {
            this.currentInputHandler.onExit(data);
            this.currentInputHandler=this.defaultInputHandler;
            this.currentInputHandler.onEnter(data);
        }
    }
}
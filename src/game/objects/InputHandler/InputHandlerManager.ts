import { DefaultInputHandler } from "./DefaultInputHandler";
import { InputHandler } from "./InputHandler";

export class InputHandlerManager<TContext>{
    
    private currentInputHandler:InputHandler<TContext>;
    private defaultInputHandler:InputHandler<TContext>;
    
    public init(currentInputHandler:InputHandler<TContext>,defaultInputHandler:InputHandler<TContext>)
    {
        this.currentInputHandler=currentInputHandler;
        this.defaultInputHandler=currentInputHandler;

    }
    
    public changeInputHandler(newHandler:InputHandler<TContext>)
    {
        this.currentInputHandler?.onExit();
        this.currentInputHandler=newHandler;
        this.currentInputHandler.onEnter();
        
    }
    public exitcurrentHandler()
    {
        if(this.currentInputHandler!=this.defaultInputHandler)
        {
            this.currentInputHandler.onExit();
            this.currentInputHandler=this.defaultInputHandler;
            this.currentInputHandler.onEnter();
        }
    }
}
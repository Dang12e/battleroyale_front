import{Scene,Input,Cameras,GameObjects,Scale,Scenes} from 'phaser';
import { CameraController } from "../objects/CameraController";
import { GridData } from "../objects/GridData";
import { GridHoverRenderer } from "../objects/GridHoverRenderer";
import { Client, Room,Callbacks } from "@colyseus/sdk";
import { Player } from "../objects/Presentation/Player";
import { ChestSpritePool } from '../objects/ObjPools/ChestSpritePool';
import { DefaultPlayerStats, PlayerState } from '../../schemas/PlayerState';
import { MyRoomState } from '../../schemas/MyRoomState';
import { RangeOverlay } from '../objects/RangeOverlay';
import { InputHandlerManager } from '../objects/InputHandler/InputHandlerManager';
import { MoveData, MoveInput } from '../objects/InputHandler/MoveInput';
import { DefaultInputHandler } from '../objects/InputHandler/DefaultInputHandler';
import { TilemapHelper } from '../../helpers/TileMapHelper';
import { DropListView } from '../objects/DropList';
import { LootInput } from '../objects/InputHandler/LootInput';

export class BattleRoyale extends Scene {
    worldContainer!: GameObjects.Container;
    uiContainer!: GameObjects.Container;
    mapContainer!: GameObjects.Container;
    chestContainer!: GameObjects.Container;
    playerContainer!: GameObjects.Container;
    overlayContainer!: GameObjects.Container;
    uiCamera!: Cameras.Scene2D.Camera;
    player!: Player;
    cameraController!: CameraController;
    gridData!: GridData;
    hoverRenderer!:GridHoverRenderer;
    rangeOverlay!:RangeOverlay;
    client:Client;
    room:Room<MyRoomState>;
    chestSpritePool!: ChestSpritePool;
    inputHandlerManager!: InputHandlerManager<BattleRoyale>;
    dropList!:DropListView;
    
    

    constructor() {
        super('BattleRoyale');
    }

    preload() {
        this.load.image('player', 'assets/PNG/Players/Tiles/tile_0000.png');
        this.load.image('chest','assets/PNG/Tiles/Tiles/tile_0216.png');
        this.load.spritesheet('maptiles','public/assets/PNG/Tiles/Tilemap/tilemap_packed.png',{ frameWidth: 16, frameHeight: 16 });
    }

    create() {
       this.initMap();
       this.initPlayer();
       this.initCameraAndContainers();
       
       this.initChestSpritePool();
       this.initColyseusCallback();
       this.initInputHandlerManager();
       this.initDropList();
       this.initInput();
       this.hoverRenderer=new GridHoverRenderer(this,this.gridData,this.overlayContainer);
       this.rangeOverlay=new RangeOverlay(this,this.gridData.cellSize,15,this.overlayContainer);
       this.refreshCameraIgnores();

    }

    private refreshCameraIgnores()
    {
        this.cameras.main.ignore(this.uiContainer);
        this.uiCamera.ignore(this.worldContainer);
    }

    private initCameraAndContainers()
    {
        this.worldContainer=this.add.container(0,0).setName('worldContainer');
        this.mapContainer=this.add.container(0,0).setName('mapContainer');
        this.chestContainer=this.add.container(0,0).setName('chestContainer');
        this.playerContainer=this.add.container(0,0).setName('playerContainer');
        this.overlayContainer=this.add.container(0,0).setName('overlayContainer');
        this.worldContainer.add([
            this.mapContainer,
            this.chestContainer,
            this.playerContainer,
            this.overlayContainer,
        ]);
        this.uiContainer=this.add.container(0,0).setName('uiContainer');

        const worldCamera=this.cameras.main;
        this.uiCamera=this.cameras.add(0,0,this.scale.width,this.scale.height,false,'uiCamera');
        worldCamera.ignore(this.uiContainer);
        this.uiCamera.ignore(this.worldContainer);

        this.playerContainer.add(this.player);

        const cellSize=this.gridData.cellSize;
        const worldWidth=cellSize*this.gridData.width;
        const worldHeight=cellSize*this.gridData.height;
        this.cameraController=new CameraController(this,{
            minZoom:0.5,
            maxZoom:2.5,
            zoomStep:0.1,
            edgeMargin:20,
            panSpeed:300,
            worldWidth,
            worldHeight,
        });
        this.cameraController.centerOn(this.player.x,this.player.y);

        const resizeUiCamera=(gameSize: Phaser.Structs.Size)=>
        {
            this.uiCamera.setViewport(0,0,gameSize.width,gameSize.height);
        };
        this.scale.on(Scale.Events.RESIZE,resizeUiCamera);
        this.events.once(Scenes.Events.SHUTDOWN,()=>
        {
            this.scale.off(Scale.Events.RESIZE,resizeUiCamera);
        });
    }

    update(time: number, delta: number): void {
        this.cameraController.update(delta);
        const mouseWorld = this.cameraController.getPointerWorldPosition();
        this.hoverRenderer.updateHover(mouseWorld.x, mouseWorld.y);
    }

    initInputHandlerManager()
    {
        this.inputHandlerManager=new InputHandlerManager();
        const defaultInput=new DefaultInputHandler("default",this,this.inputHandlerManager);
        this.inputHandlerManager.init(defaultInput,defaultInput);
    }

    async initMap()
    {
        this.gridData = new GridData({
    offsetX: 0,
    offsetY: 0,
    width: 90,
    height: 90,
    cellSize: 24,});
    const tilemaphelper=new TilemapHelper(this);
    const data=await tilemaphelper.loadJsonGrid('public/assets/json/ground.json');
    const layer=tilemaphelper.createTileLayer(data,'maptiles',16,0,1.5);
    if(layer)
    {
        this.mapContainer.add(layer);
        this.refreshCameraIgnores();
    }
    
    }
    initPlayer()
    {
      const cellSize=this.gridData.cellSize;
      this.player = new Player(this,45*cellSize+cellSize/2,45*cellSize+cellSize/2,100,'player');
    }
    initInput()
    {
     const AKey = this.input.keyboard?.addKey(Input.Keyboard.KeyCodes.A);
        AKey?.on('down',()=>
        {
            this.cameraController.setZoom(1);
            this.cameraController.centerOn(this.player.x,this.player.y);
            
            console.log("snap");
        })
     const qKey=this.input.keyboard?.addKey(Input.Keyboard.KeyCodes.Q);
     qKey?.on('down',()=>{
        this.cameraController.setZoom(1);
        this.cameraController.centerOn(this.player.x,this.player.y);
        
        this.inputHandlerManager.changeInputHandler(new MoveInput("move",this,this.inputHandlerManager));
     })
     const eKey=this.input.keyboard?.addKey(Input.Keyboard.KeyCodes.E);
     eKey?.on('down',()=>{
          this.inputHandlerManager.changeInputHandler(new LootInput('loot',this,this.inputHandlerManager));
     })

     const xKey=this.input.keyboard?.addKey(Input.Keyboard.KeyCodes.X);
     xKey?.on('down',()=>{
        this.inputHandlerManager.changeInputHandler(new DefaultInputHandler("default",this,this.inputHandlerManager));
     })

     
    }
    initChestSpritePool()
    {
       this.chestSpritePool=new ChestSpritePool(this,'chest',5,0,this.chestContainer);
       this.refreshCameraIgnores();
    }
    async initColyseusCallback()
    {
        try{
        this.client=new Client("ws://localhost:2567");
        this.room= await this.client.joinOrCreate<MyRoomState>("my_room");
        this.room.onMessage("welcome", (payload) => {
  console.log("Received welcome:", payload);
});
        const callbacks=Callbacks.get(this.room);
        const cellSize =this.gridData.cellSize;
        callbacks.onAdd('players',(player,sessionID)=>
        {
            if(sessionID==this.room.sessionId)
            {
                this.player.setPosition(player.x*cellSize+cellSize/2,player.y*cellSize+cellSize/2);
                this.player.gridPos.x=player.x;
                this.player.gridPos.y=player.y;
                this.gridData.getCell(player.x,player.y)?.setPlayer(this.player);
                this.player.healthBar.setHealth(player.hp);
                 callbacks.listen(player,'x',()=>{
                this.gridData.getCell(this.player.gridPos.x,this.player.gridPos.y)?.removePlayer();
                this.gridData.getCell(player.x,player.y)?.setPlayer(this.player);
                this.player.setPosition(player.x*cellSize+cellSize/2,player.y*cellSize+cellSize/2);
                this.player.gridPos.x=player.x;
                this.player.gridPos.y=player.y;
            });
            callbacks.listen(player,'y',()=>{
                this.gridData.getCell(this.player.gridPos.x,this.player.gridPos.y)?.removePlayer();
                this.gridData.getCell(player.x,player.y)?.setPlayer(this.player);
               this.player.setPosition(player.x*cellSize+cellSize/2,player.y*cellSize+cellSize/2);
                this.player.gridPos.x=player.x;
                this.player.gridPos.y=player.y;
            });
            callbacks.listen(player,'hp',()=>{
                this.player.healthBar.setHealth(player.hp);
            });
                return;
            }
            console.log(`player pos: ${player.x} ${player.y}`)
            const newplayer= new Player(this,player.x,player.y,DefaultPlayerStats.stats[3],'player');
            this.playerContainer.add(newplayer);
            this.refreshCameraIgnores();
            newplayer.gridPos.x=player.x;
            newplayer.gridPos.y=player.y;
            this.gridData.getCell(player.x,player.y)?.setPlayer(newplayer);
            newplayer.healthBar.setHealth(player.hp);
            callbacks.listen(player,'x',()=>{
                this.gridData.getCell(newplayer.gridPos.x,newplayer.gridPos.y)?.removePlayer();
                this.gridData.getCell(player.x,player.y)?.setPlayer(newplayer);
                newplayer.gridPos.x=player.x;
                newplayer.gridPos.y=player.y;
                newplayer.setPosition(player.x*cellSize+cellSize/2,player.y*cellSize+cellSize/2);
            });
            callbacks.listen(player,'y',()=>{
                this.gridData.getCell(newplayer.gridPos.x,newplayer.gridPos.y)?.removePlayer();
                this.gridData.getCell(player.x,player.y)?.setPlayer(newplayer);
                newplayer.gridPos.x=player.x;
                newplayer.gridPos.y=player.y;
                newplayer.setPosition(player.x*cellSize+cellSize/2,player.y*cellSize+cellSize/2);
            });
            callbacks.listen(player,'hp',()=>{
                newplayer.healthBar.setHealth(player.hp);
            });
            callbacks.onRemove("players",(player,sessionID)=>
            {
                newplayer.destroy();
            })

        });
        callbacks.onAdd('droppedItems',(item,sessionID)=>
        {
            const cell=this.gridData.getCell(item.x,item.y);
            if(cell)
            {
            cell.getChest(this.chestSpritePool);
            cell.pushItem(item);
            }
            
        
            
        });
    }
    catch(e:any)
    {
        console.log('Lỗi kết nối colyseus');
    }

    }
    initDropList()
    {
        this.dropList=new DropListView(this,30,this.uiContainer);
    }
    
    
}


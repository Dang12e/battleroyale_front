import{Scene,Input} from 'phaser';
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

export class BattleRoyale extends Scene {
    player!: Player;
    cameraController!: CameraController;
    gridData!: GridData;
    hoverRenderer!:GridHoverRenderer;
    rangeOverlay!:RangeOverlay;
    client:Client;
    room:Room<MyRoomState>;
    chestSpritePool!: ChestSpritePool;
    inputHandlerManager!: InputHandlerManager<BattleRoyale>;
    

    constructor() {
        super('BattleRoyale');
    }

    preload() {
        this.load.image('player', 'assets/PNG/Players/Tiles/tile_0000.png');
        this.load.image('chest','assets/PNG/Tiles/Tiles/tile_0216.png');
        this.load.tilemapTiledJSON('mapData', 'assets/map.json');
        this.load.image('groundTiles', 'assets/tileset_clean.png');
    }

    create() {
       this.initMap();
       this.initTilemap();
       this.initPlayer();
       this.initCamera();
       
       this.initChestSpritePool();
       this.initColyseusCallback();
       this.initInputHandlerManager()
       this.initInput();
       this.hoverRenderer=new GridHoverRenderer(this,this.gridData);
       this.rangeOverlay=new RangeOverlay(this,this.gridData.cellSize);

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

    initMap()
    {
        this.gridData = new GridData({
    offsetX: 0,
    offsetY: 0,
    width: 90,
    height: 90,
    cellSize: 24,});
    }

    initTilemap()
    {
        const map = this.make.tilemap({ key: 'mapData' });
        const tileset = map.addTilesetImage('tileset_clean', 'groundTiles', 16, 16, 0, 1);

        if (!tileset) {
            console.error("Không tìm thấy tileset 'tileset_clean' hoặc ảnh 'groundTiles'");
            return;
        }

        const scale = this.gridData.cellSize / map.tileWidth;
        map.createLayer('ground', tileset, 0, 0)?.setScale(scale).setDepth(0);
        map.createLayer('decor', tileset, 0, 0)?.setScale(scale).setDepth(1);
        map.createLayer('skulls', tileset, 0, 0)?.setScale(scale).setDepth(1);
    }
   

    initPlayer()
    {
      const cellSize=this.gridData.cellSize;
      this.player = new Player(this,0*cellSize+cellSize/2,0*cellSize+cellSize/2,100,'player');
    }
    initCamera()
    {
        const cellSize=this.gridData.cellSize;
        const worldWidth = cellSize*this.gridData.width;
        const worldHeight = cellSize*this.gridData.height;
        
        this.cameraController = new CameraController(this, {
            minZoom: 0.9,
            maxZoom: 2.5,
            zoomStep: 0.1,
            edgeMargin: 20,
            panSpeed: 800,
            worldWidth,
            worldHeight,
        });
        this.cameraController.centerOn(this.player.x, this.player.y);
      
    }
    initInput()
    {
     const spaceKey = this.input.keyboard?.addKey(Input.Keyboard.KeyCodes.A);
        spaceKey?.on('down',()=>
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

     const xKey=this.input.keyboard?.addKey(Input.Keyboard.KeyCodes.X);
     xKey?.on('down',()=>{
        this.inputHandlerManager.changeInputHandler(new DefaultInputHandler("default",this,this.inputHandlerManager));
     })
    } 

    initChestSpritePool()
    {
       this.chestSpritePool=new ChestSpritePool(this,'chest',100,0);
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
                this.player.healthBar.setHealth(player.hp);
                 callbacks.listen(player,'x',()=>{
                this.player.setPosition(player.x*cellSize+cellSize/2,player.y*cellSize+cellSize/2);
                this.player.gridPos.x=player.x;
                this.player.gridPos.y=player.y;
            });
            callbacks.listen(player,'y',()=>{
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
            newplayer.healthBar.setHealth(player.hp);
            callbacks.listen(player,'x',()=>{
                newplayer.setPosition(player.x*cellSize+cellSize/2,player.y*cellSize+cellSize/2);
            });
            callbacks.listen(player,'y',()=>{
                newplayer.setPosition(player.x*cellSize+cellSize/2,player.y*cellSize+cellSize/2);
            });
            callbacks.listen(player,'hp',()=>{
                newplayer.healthBar.setHealth(player.hp);
            });
            callbacks.onRemove("players",(player,sessionID)=>
            {
                newplayer.destroy();
            })

        })
        callbacks.onAdd('droppedItems',(item,sessionID)=>
        {
            const cell=this.gridData.getCell(item.x,item.y);
            cell?.getChest(this.chestSpritePool);
            
        })
    }
    catch(e:any)
    {
        console.log('Lỗi kết nối colyseus');
    }

    }
    
    
}


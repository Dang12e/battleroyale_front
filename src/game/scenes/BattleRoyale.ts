import{Scene,Input} from 'phaser';
import { CameraController } from "../objects/CameraController";
import { GridData } from "../objects/GridData";
import { GridHoverRenderer } from "../objects/GridHoverRenderer";
import { Client, Room,Callbacks } from "@colyseus/sdk";
import { Player } from "../objects/Presentation/Player";
import { ChestSpritePool } from '../objects/ObjPools/ChestSpritePool';

export class BattleRoyale extends Scene {
    player!: Player;
    cameraController!: CameraController;
    gridData!: GridData;
    hoverRenderer!:GridHoverRenderer;
    client:Client;
    room:Room;
    chestSpritePool!: ChestSpritePool;
    

    constructor() {
        super('BattleRoyale');
    }

    preload() {
        this.load.image('player', 'assets/PNG/Players/Tiles/tile_0000.png');
        this.load.image('chest','assets/PNG/Tiles/Tiles/tile_0216.png')
    }

    create() {
       this.initMap();
       this.initPlayer();
       this.initCamera();
       this.initInput();
       this.initChestSpritePool();
       this.initColyseusCallback();
       this.hoverRenderer=new GridHoverRenderer(this,this.gridData);
       this.player.healthBar.setHealth(45);

    }

    update(time: number, delta: number): void {
        this.cameraController.update(delta);
        const mouseWorld = this.cameraController.getPointerWorldPosition();
        this.hoverRenderer.updateHover(mouseWorld.x, mouseWorld.y);
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
    initPlayer()
    {
      const cellSize=this.gridData.cellSize;
      this.player = new Player(this,45*cellSize+cellSize/2,45*cellSize+cellSize/2,100,'player');
    }
    initCamera()
    {
        const cellSize=this.gridData.cellSize;
        const worldWidth = cellSize*this.gridData.width;
        const worldHeight = cellSize*this.gridData.height;
        
        this.cameraController = new CameraController(this, {
            minZoom: 0.5,
            maxZoom: 2.5,
            zoomStep: 0.1,
            edgeMargin: 20,
            panSpeed: 300,
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
            this.cameraController.centerOn(this.player.x,this.player.y);
            console.log("snap");
        })
    }
    initChestSpritePool()
    {
       this.chestSpritePool=new ChestSpritePool(this,'chest',5,0);
    }
    async initColyseusCallback()
    {
        try{
        this.client=new Client("ws://localhost:2567");
        this.room= await this.client.joinOrCreate("game_room");
        const callbacks=Callbacks.get(this.room);
        callbacks.onAdd('players',(player,sessionID)=>
        {
            

        })
    }
    catch(e:any)
    {
        console.log('Lỗi kết nối colyseus');
    }

    }
    
}


import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { BattleRoyale } from './scenes/BattleRoyale';
import * as Phaser from 'phaser';

// ... các import scene giữ nguyên

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: "game-container",
    backgroundColor: "#028af8",
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.RESIZE,        // Vừa khít màn hình khi F11, giữ đúng tỷ lệ 1024x768 & pixelArt
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
        },
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver,
        BattleRoyale,
    ],
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;

import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        // Chuyển thẳng sang BattleRoyale nên không cần load ảnh bg.png đã xóa
    }

    create ()
    {
        this.scene.start('BattleRoyale');
    }
}

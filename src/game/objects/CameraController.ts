import {Scene,Scenes,Cameras,Input,GameObjects,Math as PhaserMath} from 'phaser';

export interface CameraControllerConfig {
    minZoom?: number;
    maxZoom?: number;
    zoomStep?: number;
    edgeMargin?: number;
    panSpeed?: number;
    worldWidth?: number;
    worldHeight?: number;
    enabled?: boolean;
}

export class CameraController {
    private readonly scene: Scene;
    private readonly camera: Cameras.Scene2D.Camera;

    private minZoom: number;
    private maxZoom: number;
    private zoomStep: number;
    private edgeMargin: number;
    private panSpeed: number;
    private enabled: boolean;

    private readonly handleWheel: (
        pointer: Input.Pointer,
        currentlyOver: GameObjects.GameObject[],
        deltaX: number,
        deltaY: number
    ) => void;

    private readonly handleDestroy: () => void;

    constructor(scene: Scene, config: CameraControllerConfig = {}) {
        this.scene = scene;
        this.camera = scene.cameras.main;

        this.minZoom = config.minZoom ?? 0.5;
        this.maxZoom = config.maxZoom ?? 2.5;
        this.zoomStep = config.zoomStep ?? 0.1;
        this.edgeMargin = config.edgeMargin ?? 40;
        this.panSpeed = config.panSpeed ?? 600;
        this.enabled = config.enabled ?? true;

        if (config.worldWidth !== undefined && config.worldHeight !== undefined) {
            this.setBounds(0, 0, config.worldWidth, config.worldHeight);
            console.log(config.worldHeight,config.worldWidth);
        }

        this.handleWheel = (pointer, _currentlyOver, _deltaX, deltaY) => {
            if (!this.enabled) return;

            const direction = deltaY > 0 ? -1 : 1;
            const nextZoom = PhaserMath.Clamp(
                this.camera.zoom + direction * this.zoomStep,
                this.minZoom,
                this.maxZoom
            );

            if (nextZoom === this.camera.zoom) return;

            const beforeWorldPoint = this.camera.getWorldPoint(pointer.x, pointer.y);
            this.camera.setZoom(nextZoom);
            const afterWorldPoint = this.camera.getWorldPoint(pointer.x, pointer.y);

            this.camera.scrollX += beforeWorldPoint.x - afterWorldPoint.x;
            this.camera.scrollY += beforeWorldPoint.y - afterWorldPoint.y;
        };

        this.handleDestroy = () => {
            this.destroy();
        };

        this.scene.input.on("wheel", this.handleWheel);
        this.scene.events.once(Scenes.Events.SHUTDOWN, this.handleDestroy);
        this.scene.events.once(Scenes.Events.DESTROY, this.handleDestroy);
    }

    public update(delta: number): void {
    if (!this.enabled) return;

    const pointer = this.scene.input.activePointer;
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    // Chuột phải nằm trong canvas (và đã có tương tác)
    const isInsideCanvas =
        pointer.x >= 0 &&
        pointer.x <= width &&
        pointer.y >= 0 &&
        pointer.y <= height;

    if (!isInsideCanvas) return;

    // Chỉ kích hoạt khi chuột tiến vào vùng viền bên trong canvas (cách mép <= edgeMargin)
    const isNearEdge =
        pointer.x <= this.edgeMargin ||
        pointer.x >= width - this.edgeMargin ||
        pointer.y <= this.edgeMargin ||
        pointer.y >= height - this.edgeMargin;

    if (!isNearEdge) return;

    const centerX = width / 2;
    const centerY = height / 2;

    const dx = pointer.x - centerX;
    const dy = pointer.y - centerY;
    const len = Math.hypot(dx, dy);

    if (len > 0) {
        const nx = dx / len;
        const ny = dy / len;

        const dt = delta / 1000;
        const speed = this.panSpeed / this.camera.zoom;

        this.camera.scrollX += nx * speed * dt;
        this.camera.scrollY += ny * speed * dt;
    }
}

    public setBounds(x: number, y: number, width: number, height: number): void {
        this.camera.setBounds(x, y, width, height);
    }

    public centerOn(x: number, y: number): void {
        this.camera.centerOn(x, y);
    }

    public setZoom(zoom: number): void {
        this.camera.setZoom(PhaserMath.Clamp(zoom, this.minZoom, this.maxZoom));
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    public destroy(): void {
        this.scene.input.off("wheel", this.handleWheel);
        this.scene.events.off(Scenes.Events.SHUTDOWN, this.handleDestroy);
        this.scene.events.off(Scenes.Events.DESTROY, this.handleDestroy);
    }

    public getPointerWorldPosition(pointer?: Input.Pointer): { x: number; y: number } {
    const activePointer = pointer ?? this.scene.input.activePointer;
    const worldPoint = this.camera.getWorldPoint(activePointer.x, activePointer.y);

    return {
        x: worldPoint.x,
        y: worldPoint.y,
    };
}
}
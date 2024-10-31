import { Entity } from "./entity/Entity";
import { CollisionModule } from "./entity/modules/CollisionModule";
import { addKeyPressListener, keyboard, removeKeyPressListener } from "./input/keyboard";
import { clamp } from "./math/util/clamp";
import { Vector2 } from "./math/vector/Vector2";

type FullScreenOption = boolean | { padding: Vector2 };

interface CanvasOptions {
  /** Whether to adjust canvas width and height to window size @default false */
  fullScreen?: FullScreenOption;
  /** Width and height of the canvas (if also fullscreen is true, this will scale to fullscreen while keeping aspect ratio) */
  size?: Vector2;
  /** Background color of the canvas (default clearing color) @default transparent*/
  background?: string;
  /** Whether to update and re-draw canvas automatically @default true */
  animate?: boolean;
  /** Use faster friction that looks a bit worse @default false */
  fastFriction?: boolean;
}

export type UpdateListener = (deltaTime: number) => void;

export class Canvas {
  public htmlCanvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  /** Color for clearing the canvas */
  public background: string;

  private entities: Entity[];
  private animate: boolean;
  private lastUpdate: number = Date.now();
  private fullScreen: FullScreenOption;
  private beforeUpdateListeners: UpdateListener[] = [];
  private afterUpdateListeners: UpdateListener[] = [];
  private screen: HTMLCanvasElement;
  private canvasContext: CanvasRenderingContext2D;
  private size?: Vector2;
  private scaledScreenSize: Vector2;
  private updateIntervalId: number | null = null;
  private requestAnimationFrameId: number | null = null;

  private debugCollision = Boolean(localStorage.getItem("debugCollision"));
  private debugKeyPresses = Boolean(localStorage.getItem("debugKeyPresses"));
  private slowMode = Boolean(localStorage.getItem("slowMode"));

  /**
   * Wraps around an HTML canvas element and provides drawing and updating functionality
   * You can also trigger debugging with:
   * - F4 + b: Toggle collision shape drawing
   * - F4 + k: Toggle pressed keys display
   * - F4 + s: Toggle frame by frame mode. Pressing F4+n will advance n frames
   * @param canvasElementId - html canvas element id to use (eg. if you have `<canvas id="game-canvas"></canvas>` provide `"game-canvas"`)
   * @param canvasOptions - options for the canvas
   */
  constructor(canvasElementId: string, canvasOptions: CanvasOptions = {}) {
    const { fullScreen, size, background, animate } = canvasOptions;
    this.background = background || "transparent";
    this.animate = animate ?? true;
    this.fullScreen = fullScreen ?? false;
    this.entities = [];
    this.size = size;

    const canvas = document.getElementById(canvasElementId);
    if (!canvas) throw new Error(`Element with id ${canvasElementId} not found`);
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error(`Element with id ${canvasElementId} is not a canvas`);

    this.htmlCanvas = canvas;
    this.screen = document.createElement("canvas");

    const context = this.screen.getContext("2d");
    const canvasContext = this.htmlCanvas.getContext("2d");
    if (!context || !canvasContext) throw new Error("Could not get 2d rendering context");
    this.context = context;
    this.canvasContext = canvasContext;

    this.scaledScreenSize = new Vector2(this.htmlCanvas.width, this.htmlCanvas.height);
    this.resize();
    this.clear();

    if (this.animate && !this.slowMode) {
      this.updateIntervalId = setInterval(this.update, 1000 / 60) as unknown as number;
    }
    this.update();
    this.draw();

    if (fullScreen) {
      window.addEventListener("resize", this.resize);
    }

    addKeyPressListener(["F4", "b"], this.onDebugCollision);
    addKeyPressListener(["F4", "k"], this.onDebugKeyPresses);
    addKeyPressListener(["F4", "s"], this.onDebugSlowMode);
    addKeyPressListener(["F4", "n"], this.onDebugNextFrame);
  }

  private onDebugCollision = () => {
    this.debugCollision = !this.debugCollision;

    if (this.debugCollision) {
      localStorage.setItem("debugCollision", "1");
    } else {
      localStorage.removeItem("debugCollision");
    }
  };
  private onDebugKeyPresses = () => {
    this.debugKeyPresses = !this.debugKeyPresses;

    if (this.debugKeyPresses) {
      localStorage.setItem("debugKeyPresses", "1");
    } else {
      localStorage.removeItem("debugKeyPresses");
    }
  };
  onDebugSlowMode = () => {
    this.slowMode = !this.slowMode;

    if (this.slowMode) {
      localStorage.setItem("slowMode", "1");
    } else {
      localStorage.removeItem("slowMode");
    }

    if (this.slowMode && this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
    } else {
      this.updateIntervalId = setInterval(this.update, 1000 / 60) as unknown as number;
    }
  };
  private onDebugNextFrame = () => {
    if (this.slowMode) {
      this.update();
    }
  };

  /** Removes event listeners, intervals, entities etc.  */
  unmount = () => {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
    }
    if (this.requestAnimationFrameId) {
      cancelAnimationFrame(this.requestAnimationFrameId);
    }
    removeKeyPressListener(["F4", "b"], this.onDebugCollision);
    removeKeyPressListener(["F4", "k"], this.onDebugKeyPresses);
    removeKeyPressListener(["F4", "s"], this.onDebugSlowMode);
    removeKeyPressListener(["F4", "n"], this.onDebugNextFrame);
    window.removeEventListener("resize", this.resize);
    this.entities.forEach((entity) => this.removeEntity(entity));
  };

  get middle(): Vector2 {
    return new Vector2(this.screenWidth / 2, this.screenHeight / 2);
  }
  /** Width of the drawing space. Can differ from screen width if both fullScreen and size is configured */
  get screenWidth(): number {
    return this.screen.width;
  }
  /** Height of the drawing space. Can differ from screen width if both fullScreen and size is configured */
  get screenHeight(): number {
    return this.screen.height;
  }
  /** Total canvas width. Can differ from screen width if both fullScreen and size is configured */
  get canvasWidth(): number {
    return this.htmlCanvas.width;
  }
  /** Total canvas height. Can differ from screen width if both fullScreen and size is configured */
  get canvasHeight(): number {
    return this.htmlCanvas.height;
  }

  clear = () => {
    this.context.fillStyle = this.background;
    this.context.fillRect(0, 0, this.screenWidth, this.screenHeight);

    this.canvasContext.fillStyle = "#222";
    this.canvasContext.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  };

  resize = () => {
    this.htmlCanvas.width = this.fullScreen ? window.innerWidth : this.size?.x || this.canvasWidth;
    this.htmlCanvas.height = this.fullScreen ? window.innerHeight : this.size?.y || this.canvasHeight;

    if (this.fullScreen && typeof this.fullScreen === "object" && "padding" in this.fullScreen) {
      const { padding } = this.fullScreen;
      this.htmlCanvas.width -= padding.x;
      this.htmlCanvas.height -= padding.y;
    }

    this.screen.width = this.size?.x || this.canvasWidth;
    this.screen.height = this.size?.y || this.canvasHeight;
    this.scaledScreenSize.x = this.canvasWidth;
    this.scaledScreenSize.y = this.canvasHeight;

    if (this.fullScreen && this.size) {
      const aspectRatio = this.size.x / this.size.y;
      const windowAspectRatio = this.canvasWidth / this.canvasHeight;
      if (aspectRatio > windowAspectRatio) {
        this.scaledScreenSize.x = this.canvasWidth;
        this.scaledScreenSize.y = this.canvasWidth / aspectRatio;
      } else {
        this.scaledScreenSize.x = this.canvasHeight * aspectRatio;
        this.scaledScreenSize.y = this.canvasHeight;
      }
    }
  };

  drawCircle = (position: Vector2, radius: number, color: { fill?: string; stroke?: string }, strokeWidth = color.stroke ? 1 : 0) => {
    this.context.fillStyle = color.fill || "transparent";
    this.context.strokeStyle = color.stroke || "transparent";
    this.context.lineWidth = strokeWidth;
    this.context.beginPath();
    this.context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    this.context.fill();
    this.context.stroke();
  };

  drawRectangle = (
    position: Vector2,
    width: number,
    height: number,
    color: { fill?: string; stroke?: string },
    strokeWidth = color.stroke ? 1 : 0,
  ) => {
    this.context.fillStyle = color.fill || "transparent";
    this.context.strokeStyle = color.stroke || "transparent";
    this.context.lineWidth = strokeWidth;
    this.context.beginPath();
    this.context.rect(position.x, position.y, width, height);
    this.context.fill();
    this.context.stroke();
  };

  drawLine = (start: Vector2, end: Vector2, color: string, thickness: number) => {
    this.context.strokeStyle = color;
    this.context.lineWidth = thickness;

    this.context.moveTo(start.x, start.y);
    this.context.lineTo(end.x, end.y);
    this.context.stroke();
  };

  drawText = (
    text: string,
    position: Vector2,
    options: {
      fontSize?: number;
      font?: string;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
      maxWidth?: number;
      color?: string;
    } = {},
  ) => {
    this.context.textBaseline = options.textBaseline || "alphabetic";
    this.context.textAlign = options.textAlign || "left";
    this.context.font = `${options.fontSize || 16} ${options.font || "Monospace"}`;
    this.context.fillStyle = options.color || "white";

    this.context.fillText(text, position.x, position.y, options.maxWidth);
  };

  addBeforeUpdateListener = (listener: UpdateListener) => {
    this.beforeUpdateListeners.push(listener);
  };
  addAfterUpdateListener = (listener: UpdateListener) => {
    this.afterUpdateListeners.push(listener);
  };

  removeBeforeUpdateListener = (listener: UpdateListener) => {
    const index = this.beforeUpdateListeners.indexOf(listener);
    if (index !== -1) {
      this.beforeUpdateListeners.splice(index, 1);
    }
  };
  removeAfterUpdateListener = (listener: UpdateListener) => {
    const index = this.afterUpdateListeners.indexOf(listener);
    if (index !== -1) {
      this.afterUpdateListeners.splice(index, 1);
    }
  };

  /** Add thing that will be drawn (and updated if animate is set to *true*) */
  addEntity = (entity: Entity) => {
    this.entities.push(entity);
  };
  removeEntity = (entity: Entity) => {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
      entity.onRemove?.();
    }
  };

  private draw = () => {
    this.clear();

    this.entities.forEach((entity) => entity.draw(this));
    if (this.debugCollision) {
      this.drawDebugCollision();
    }
    if (this.debugKeyPresses) {
      this.drawPressedKeys();
    }

    this.flip();
    if (this.animate) {
      this.requestAnimationFrameId = requestAnimationFrame(this.draw);
    }
  };

  private flip = () => {
    this.canvasContext.imageSmoothingEnabled = false;
    this.canvasContext.drawImage(
      this.screen,
      0,
      0,
      this.screen.width,
      this.screen.height,
      (this.canvasWidth - this.scaledScreenSize.x) / 2,
      (this.canvasHeight - this.scaledScreenSize.y) / 2,
      this.scaledScreenSize.x,
      this.scaledScreenSize.y,
    );
  };

  private update = () => {
    const now = Date.now();
    const deltaTime = clamp((now - this.lastUpdate) / 1000, 0, 1 / 30);

    this.beforeUpdateListeners.forEach((listener) => listener(deltaTime));
    this.entities.forEach((entity) => {
      entity.update(deltaTime, this);
    });
    this.afterUpdateListeners.forEach((listener) => listener(deltaTime));

    this.lastUpdate = now;
  };

  private drawDebugCollision = () => {
    this.entities.forEach((entity) => {
      const collisionModule = entity.findModule(CollisionModule);
      collisionModule?.collisionShapes?.forEach((shape) => {
        shape.draw(this);
      });
    });
  };

  private drawPressedKeys = () => {
    const pressedKeys: string[] = [];

    keyboard.forEach((keyInfo, key) => {
      if (!keyInfo.pressed) return;
      pressedKeys.push(key);
    });

    this.drawText(pressedKeys.sort((a, b) => b.length - a.length).join(" + "), new Vector2(10 + 10, this.screenHeight - 10), {
      fontSize: 20,
    });
  };
}

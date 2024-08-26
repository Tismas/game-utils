import { Canvas } from "./Canvas";
import { Entity } from "./entity/Entity";
import { CollisionModule } from "./entity/modules/CollisionModule";
import { FrictionModule } from "./entity/modules/FrictionModule";
import { GravityModule } from "./entity/modules/GravityModule";
import { MovementModule } from "./entity/modules/MovementModule";
import { Vector2 } from "./math/Vector2";
import { CollisionCircle } from "./math/collision";

const canvas = new Canvas("game-canvas", { fullScreen: true, background: "#111" });

class Ball extends Entity {
  radius: number = 5;
  color: string = "#fff";

  constructor() {
    super();

    this.position = Vector2.random([0, 0], [canvas.screenWidth, canvas.screenHeight]);
    this.addModule(
      new MovementModule(this, { clampToScreen: { type: "paddingAllSides", padding: this.radius } }),
      new CollisionModule(this, { collisionShapes: [new CollisionCircle({ parent: this, radius: this.radius })] }),
      new GravityModule(this, { gravity: 100 }),
      new FrictionModule(this, { friction: 0.01 }),
    );
  }

  draw(canvas: Canvas) {
    super.draw(canvas);
    canvas.drawCircle(this.position, this.radius, { fill: this.color });
  }

  update(deltaTime: number, canvas: Canvas) {
    super.update(deltaTime, canvas);
  }
}

const intervalId = setInterval(() => {
  canvas.addEntity(new Ball());
}, 100);

setTimeout(() => {
  clearInterval(intervalId);
}, 1000 * 30);

import { Vector2, randomFloat } from "@naszos/utils";

import { Canvas } from "./Canvas";
import { Entity } from "./entity/Entity";
import { CollisionModule } from "./entity/modules/CollisionModule";
import { FrictionModule } from "./entity/modules/FrictionModule";
import { GravityModule } from "./entity/modules/GravityModule";
import { MovementModule } from "./entity/modules/MovementModule";
import { CollisionCircle } from "./math/collision/circle";
import { CircleConstraint } from "./math/constraint";

const canvas = new Canvas("game-canvas", { fullScreen: true, background: "#111" });
const constraintRadius = 400;

class Ball extends Entity {
  radius: number;
  color: string;

  constructor(position: Vector2, acceleration?: Vector2) {
    super();

    this.position = position;
    this.radius = randomFloat(5, 20);
    this.color = "#fff";
    const constraint = new CircleConstraint(new Vector2(canvas.screenWidth / 2, canvas.screenHeight / 2), constraintRadius);
    // const constraint = new RectConstraint(Vector2.zero(), canvas.screenWidth, canvas.screenHeight);
    this.addModule(
      new MovementModule(this, { constraint, acceleration }),
      new CollisionModule(this, { collisionShape: new CollisionCircle({ parent: this, radius: this.radius }) }),
      new GravityModule(this, { gravity: 2000 }),
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

const force = 300000;
let dir = -1;
let step = 0.1;
const intervalId = setInterval(() => {
  if (dir > 1 || dir < -1) step = -step;
  dir += step;
  canvas.addEntity(new Ball(canvas.middle.add(new Vector2(0, -300)), new Vector2(dir * force, force)));
}, 100);

setTimeout(() => {
  clearInterval(intervalId);
}, 1000 * 30);

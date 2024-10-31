import { Canvas } from "./Canvas";
import { Entity } from "./entity/Entity";
import { CollisionModule } from "./entity/modules/CollisionModule";
import { FrictionModule } from "./entity/modules/FrictionModule";
import { GravityModule } from "./entity/modules/GravityModule";
import { MovementModule } from "./entity/modules/MovementModule";
import { CollisionCircle } from "./math/collision/circle";
import { CircleConstraint } from "./math/constraint";
import { randomInRange } from "./math/util/random";
import { Vector2 } from "./math/vector/Vector2";

const canvas = new Canvas("game-canvas", { fullScreen: true, background: "#111" });
const constraintRadius = 400;
const ballRadius = 25;

class Ball extends Entity {
  radius: number = ballRadius;
  color: string = "#fff";

  constructor(position?: Vector2) {
    super();

    this.position = position || Vector2.random([0, 0], [canvas.screenWidth, canvas.screenHeight]);
    const constraint = new CircleConstraint(new Vector2(canvas.screenWidth / 2, canvas.screenHeight / 2), constraintRadius);
    // const constraint = new RectConstraint(Vector2.zero(), canvas.screenWidth, canvas.screenHeight);
    this.addModule(
      new MovementModule(this, { constraint }),
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
  const dx = randomInRange(-constraintRadius + ballRadius, constraintRadius - ballRadius);
  canvas.addEntity(new Ball(canvas.middle.add(new Vector2(dx, 0))));
}, 500);

setTimeout(() => {
  clearInterval(intervalId);
}, 1000 * 30);

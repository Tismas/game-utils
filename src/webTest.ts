import { Canvas } from "./Canvas";
import { Entity } from "./entity/Entity";
import { CollisionModule } from "./entity/modules/CollisionModule";
import { FrictionModule } from "./entity/modules/FrictionModule";
import { GravityModule } from "./entity/modules/GravityModule";
import { MovementModule } from "./entity/modules/MovementModule";
import { Vector2 } from "./math/Vector2";
import { CollisionCircle, CollisionRectangle } from "./math/collision";

const canvas = new Canvas("game-canvas", { fullScreen: true, background: "#111" });

class Ball extends Entity {
  radius: number = 25;
  color: string = "#fff";

  constructor(position?: Vector2) {
    super();

    this.position = position || Vector2.random([0, 0], [canvas.screenWidth, canvas.screenHeight]);
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

class Square extends Entity {
  a: number = 50;
  color: string = "#fff";

  constructor(position?: Vector2) {
    super();

    this.position = position || Vector2.random([0, 0], [canvas.screenWidth, canvas.screenHeight]);
    this.addModule(
      new MovementModule(this, { clampToScreen: { type: "paddingSelective", right: this.a, bottom: this.a } }),
      new CollisionModule(this, { collisionShapes: [new CollisionRectangle({ parent: this, width: this.a, height: this.a })] }),
      new GravityModule(this, { gravity: 100 }),
      new FrictionModule(this, { friction: 0.01 }),
    );
  }

  draw(canvas: Canvas) {
    super.draw(canvas);
    canvas.drawRectangle(this.position, this.a, this.a, { fill: this.color });
  }

  update(deltaTime: number, canvas: Canvas) {
    super.update(deltaTime, canvas);
  }
}

// const intervalId = setInterval(() => {
//   canvas.addEntity(Math.random() > 0.5 ? new Square() : new Ball());
// }, 100);

// setTimeout(() => {
//   clearInterval(intervalId);
// }, 1000 * 30);

canvas.addEntity(new Ball(canvas.middle));
canvas.addEntity(new Square(canvas.middle.add(new Vector2(-25, 100))));

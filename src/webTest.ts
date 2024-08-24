import { Canvas } from "./Canvas";
import { Vector2 } from "./math/Vector2";
import { clamp } from "./math/bounds";
import { CollisionCircle } from "./math/collision";
import { PhysicsBody } from "./physics/PhysicsBody";

const _canvas = new Canvas("game-canvas", { fullScreen: true, background: "#111" });

class Ball extends PhysicsBody {
  radius: number;
  color: string;

  constructor() {
    super({ position: Vector2.random([0, 0], [_canvas.screenWidth, _canvas.screenHeight]), gravity: 100, friction: 10 });
    this.color = "#fff";
    this.radius = 10;
    this.collisionShapes = [new CollisionCircle({ parent: this, radius: this.radius })];

    this.setClickHandler(this.onClick);
  }

  onClick = () => console.log("clicked");

  draw(canvas: Canvas) {
    canvas.drawCircle(this.position, this.radius, { fill: this.color });
  }

  update(deltaTime: number, canvas: Canvas) {
    super.update(deltaTime, canvas);

    this.position.x = clamp(this.position.x, this.radius, canvas.screenWidth - this.radius - 1, () => (this.velocity.x *= -1));
    this.position.y = clamp(this.position.y, this.radius, canvas.screenHeight - this.radius - 1, () => (this.velocity.y *= -1));
  }
}

_canvas.addEntity(new Ball());

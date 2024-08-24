# Game utils

Random utilities to make creating html canvas games easier

## How to get started

Create a html document with `<canvas>` element and give it an id eg. `<canvas id="game-canvas"></canvas>`. Then you add js/ts.

Here's an example for ball bouncing up and down, a bit lower with every bounce, that also has onClick handler

```typescript
const canvas = new Canvas("game-canvas", { fullScreen: true, background: "#111" });

class Ball extends PhysicsBody {
  radius: number;
  color: string;

  constructor() {
    super({ position: Vector2.random([0, 0], [canvas.screenWidth, canvas.screenHeight]), gravity: 100, friction: 10 });
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

canvas.addEntity(new Ball());
```

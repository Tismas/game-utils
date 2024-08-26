# Game utils

Random utilities to make creating html canvas games easier

## Todo

- fix collision & gravity when more entities gather on the floor
- move layers to CollisionShape instead of CollisionModule
- test rectangle-rectangle and rectangle-circle collisions

## How to get started

Create a html document with `<canvas>` element and give it an id eg. `<canvas id="game-canvas"></canvas>`. Then you add js/ts.

Here's an example for ball bouncing up and down, a bit lower with every bounce, that also has onClick handler

```typescript
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
```

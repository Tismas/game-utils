import { Canvas } from "~/Canvas";

import { CollisionShape } from "./collision";
import { Vector2 } from "./vector/Vector2";

abstract class ConstraintBase {
  position: Vector2;

  constructor(position: Vector2) {
    this.position = position;
  }

  abstract constrainPosition(collisionShape: CollisionShape): Vector2;

  abstract draw(ctx: Canvas): void;
}

export class RectConstraint extends ConstraintBase {
  width: number;
  height: number;

  constructor(position: Vector2, width: number, height: number) {
    super(position);
    this.width = width;
    this.height = height;
  }

  constrainPosition({ position, radius }: CollisionShape): Vector2 {
    const newPosition = position.clone();

    if (position.x - radius < this.position.x) newPosition.x = this.position.x + radius;
    if (position.y - radius < this.position.y) newPosition.y = this.position.y + radius;
    if (position.x + radius > this.position.x + this.width) newPosition.x = this.position.x + this.width - radius;
    if (position.y + radius > this.position.y + this.height) newPosition.y = this.position.y + this.height - radius;

    return newPosition;
  }

  draw(canvas: Canvas) {
    canvas.drawRectangle(this.position, this.width, this.height, { stroke: "#ccc" });
  }
}

export class CircleConstraint extends ConstraintBase {
  radius: number;

  constructor(position: Vector2, radius: number) {
    super(position);
    this.radius = radius;
  }

  constrainPosition({ position, radius }: CollisionShape): Vector2 {
    const toObj = position.subtract(this.position);
    const distance = toObj.length;
    if (distance + radius > this.radius) {
      const dir = toObj.divide(distance);
      return this.position.add(dir.multiply(this.radius - radius));
    }
    return position;
  }

  draw(canvas: Canvas) {
    canvas.drawCircle(this.position, this.radius, { stroke: "#ccc" });
  }
}

export type Constraint = RectConstraint | CircleConstraint;

import { Canvas } from "~/Canvas";

import type { CollisionShape } from ".";
import { CollisionShapeBase, CollisionShapeOptions } from "./collisionBase";

interface CollisionShapeCircleOptions extends CollisionShapeOptions {
  radius: number;
}

/**
 * Collision shape for the Entity. Can be triggered to be drawn for debugging with F3+B.
 */
export class CollisionCircle extends CollisionShapeBase {
  radius: number;

  constructor(options: CollisionShapeCircleOptions) {
    super(options);
    this.radius = options.radius;
  }

  draw(canvas: Canvas): void {
    canvas.drawCircle(this.position, this.radius, { stroke: "red" });
  }

  isColliding(other: CollisionShape): boolean {
    if (other instanceof CollisionCircle) {
      return other.position.distanceTo(this.position) < this.radius + other.radius;
    }

    throw new Error("Unsupported collision shape", other);
  }
}

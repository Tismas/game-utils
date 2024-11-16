import { Vector2 } from "@naszos/utils";
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

  getCollision(other: CollisionShape): Vector2 | false {
    if (other instanceof CollisionCircle) {
      const collisionAxis = this.position.subtract(other.position);
      const dist = collisionAxis.length;
      const radiusSum = this.radius + other.radius;
      if (dist > radiusSum) return false;

      const dir = collisionAxis.divide(dist);
      const delta = radiusSum - dist;
      return dir.multiply(delta);
    }

    throw new Error("Unsupported collision shape", other);
  }
}

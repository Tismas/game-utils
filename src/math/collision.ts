import { Canvas, Entity } from "~/Canvas";

import { Vector2 } from "./Vector2";

interface CollisionShapeOptions {
  parent: Entity;
  offset?: Vector2;
  triggerCollisionCallback?: boolean;
  onRemove?: () => void;
  onCollision?: () => void;
}

abstract class CollisionShapeBase {
  parent: Entity;
  offset: Vector2;
  triggerCollisionCallback: boolean;
  private _onRemove?: () => void;
  _onCollision?: () => void;

  constructor({ parent, offset, triggerCollisionCallback, onRemove, onCollision }: CollisionShapeOptions) {
    this.parent = parent;
    this.offset = offset || Vector2.zero();
    this.triggerCollisionCallback = triggerCollisionCallback ?? true;
    this._onRemove = onRemove;
    this._onCollision = onCollision;
  }

  onRemove(): void {
    this._onRemove?.();
  }

  get position(): Vector2 {
    return this.parent.position.add(this.offset);
  }

  abstract draw(canvas: Canvas): void;
  abstract isColliding(other: CollisionShape): boolean;
}

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
    let colliding = false;

    if (other instanceof CollisionCircle) {
      const distance = this.position.distanceTo(other.position);
      colliding = distance < this.radius + other.radius;
    }

    if (other instanceof CollisionRectangle) {
      const closestPoint = new Vector2(
        Math.max(other.position.x, Math.min(this.position.x, other.position.x + other.width)),
        Math.max(other.position.y, Math.min(this.position.y, other.position.y + other.height)),
      );
      const distance = this.position.distanceTo(closestPoint);
      colliding = distance < this.radius;
    }

    if (colliding && this.triggerCollisionCallback && other.triggerCollisionCallback) {
      this._onCollision?.();
      other._onCollision?.();
    }
    return colliding;
  }
}

interface CollisionShapeRectangleOptions extends CollisionShapeOptions {
  width: number;
  height: number;
}

/**
 * Collision shape for the Entity. Can be triggered to be drawn for debugging with F3+B.
 */
export class CollisionRectangle extends CollisionShapeBase {
  width: number;
  height: number;

  constructor(options: CollisionShapeRectangleOptions) {
    super(options);
    this.width = options.width;
    this.height = options.height;
  }

  draw(canvas: Canvas): void {
    canvas.drawRectangle(this.position, this.width, this.height, { stroke: "red" });
  }

  isColliding(other: CollisionShape): boolean {
    if (other instanceof CollisionCircle) {
      return other.isColliding(this);
    }

    let colliding = false;

    if (other instanceof CollisionRectangle) {
      const xOverlap = this.position.x + this.width >= other.position.x && other.position.x + other.width >= this.position.x;
      const yOverlap = this.position.y + this.height >= other.position.y && other.position.y + other.height >= this.position.y;
      colliding = xOverlap && yOverlap;
    }

    if (colliding && this.triggerCollisionCallback && other.triggerCollisionCallback) {
      this._onCollision?.();
      other._onCollision?.();
    }

    return colliding;
  }
}

/**
 * Collision shape for the Entity. Can be triggered to be drawn for debugging with F3+B.
 */
export type CollisionShape = CollisionCircle | CollisionRectangle;

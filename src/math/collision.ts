import { Canvas } from "~/Canvas";
import { Entity } from "~/entity/Entity";

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
    if (!(parent instanceof Entity)) throw new Error("CollisionShape parent must be an Entity");

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
  abstract getPositionAfterCollision(other: CollisionShape): Vector2;
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
    } else if (other instanceof CollisionRectangle) {
      const closestPoint = this.getClosesPointToRectangle(other);
      const distance = this.position.distanceTo(closestPoint);
      colliding = distance < this.radius;
    } else {
      throw new Error("Unknown CollisionShape type");
    }

    if (colliding && this.triggerCollisionCallback && other.triggerCollisionCallback) {
      this._onCollision?.();
      other._onCollision?.();
    }
    return colliding;
  }

  getPositionAfterCollision(other: CollisionShape): Vector2 {
    if (other instanceof CollisionCircle) {
      const radiusSum = this.radius + other.radius;
      const shiftVector = this.position.withAngle(this.position.angleTo(other.position)).withLength(radiusSum + 1);
      return this.position.add(shiftVector);
    }

    if (other instanceof CollisionRectangle) {
      const closestPoint = this.getClosesPointToRectangle(other);
      const shiftVector = closestPoint.withAngle(closestPoint.angleTo(this.position)).withLength(this.radius + 1);
      return this.position.add(shiftVector);
    }

    throw new Error("Unknown CollisionShape type");
  }

  getClosesPointToRectangle(other: CollisionRectangle): Vector2 {
    const closestPoint = new Vector2(
      Math.max(other.position.x, Math.min(this.position.x, other.position.x + other.width)),
      Math.max(other.position.y, Math.min(this.position.y, other.position.y + other.height)),
    );
    return closestPoint;
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
    } else {
      throw new Error("Unknown CollisionShape type");
    }

    if (colliding && this.triggerCollisionCallback && other.triggerCollisionCallback) {
      this._onCollision?.();
      other._onCollision?.();
    }

    return colliding;
  }

  getPositionAfterCollision(other: CollisionShape): Vector2 {
    if (other instanceof CollisionCircle) {
      return this.getPositionAfterCollision(other);
    }

    if (other instanceof CollisionRectangle) {
      const dx = this.position.x - other.position.x;
      const dy = this.position.y - other.position.y;
      const xOverlap = Math.abs(dx) + this.width;
      const yOverlap = Math.abs(dy) + this.height;
      if (dx > dy) {
        return this.position.add(new Vector2(xOverlap + 1, 0));
      } else {
        return this.position.add(new Vector2(0, yOverlap + 1));
      }
    }

    throw new Error("Unknown CollisionShape type");
  }
}

/**
 * Collision shape for the Entity. Can be triggered to be drawn for debugging with F3+B.
 */
export type CollisionShape = CollisionCircle | CollisionRectangle;

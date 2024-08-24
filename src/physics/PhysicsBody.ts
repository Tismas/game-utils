import { Canvas, Entity } from "~/Canvas";
import { getMousePosition } from "~/input/mouse";
import { Vector2 } from "~/math/Vector2";
import { CollisionCircle, CollisionShape } from "~/math/collision";

interface PhysicsObjectOptions {
  position: Vector2;
  /** Movement direction. Will be used to update the position of the body. @default 0,0 */
  velocity?: Vector2;
  /** How fast body will slow down when moving. 0 means it will move at constant speed. @default 0 */
  friction?: number;
  /** How fast body will fall down. 0 means it will not fall. @default 0 */
  gravity?: number;
  /** Whether to decrease velocity after colliding with other object. @default false */
  keepMomentumOnCollision?: boolean;
  /** Collision shapes for the body. Will be used for collision detection. */
  collisionShapes?: Array<CollisionShape>;
  /** Should be affected by physics or stay in place? @default false */
  isStatic?: boolean;
}

export const isPhysicsBody = (object: unknown): object is PhysicsBody => {
  return object instanceof PhysicsBody;
};

export class PhysicsBody implements Entity {
  friction: number;
  position: Vector2;
  velocity: Vector2;
  keepMomentumOnCollision: boolean;
  gravity: number;
  collisionShapes?: Array<CollisionShape>;
  isStatic?: boolean;
  /** Based on collision shapes */
  private _onClick?: () => void;
  private _onCollision?: (other: PhysicsBody) => void;

  /** Provides basic features that are commonly used eg. collision detection */
  constructor({ velocity, position, friction, gravity, keepMomentumOnCollision, collisionShapes, isStatic }: PhysicsObjectOptions) {
    this.position = position;
    this.velocity = velocity || Vector2.zero();
    this.collisionShapes = collisionShapes;
    this.friction = friction || 0;
    this.gravity = gravity || 0;
    this.keepMomentumOnCollision = keepMomentumOnCollision ?? false;
    this.isStatic = isStatic ?? false;
  }
  draw(_canvas: Canvas): void {}

  setCollisionCallback(callback: (other: PhysicsBody) => void): void {
    this._onCollision = callback;
  }

  /** Based on collision shape */
  setClickHandler(callback: () => void): void {
    this._onClick = callback;
    window.addEventListener("click", this.clickCallback);
  }

  private clickCallback = (): void => {
    if (!this._onClick) return;

    const mousePos = getMousePosition();
    const collidingShape = this.collisionShapes?.find((shape) => {
      return shape.isColliding(
        new CollisionCircle({ parent: this, offset: this.position.subtract(mousePos), radius: 1, triggerCollisionCallback: false }),
      );
    });

    if (collidingShape) {
      this._onClick();
    }
  };

  onRemove(): void {
    window.removeEventListener("click", this.clickCallback);
    this.collisionShapes?.forEach((shape) => shape.onRemove());
  }

  /** Apply gravitation force based on the distance between 2 bodies */
  gravitateTo(force: number, other: PhysicsBody, deltaTime: number): void {
    if (force === 0 || this.isStatic) return;

    const dist = other.position.distanceTo(this.position);
    const acc = Vector2.zero()
      .withLength(force / dist ** 2)
      .withAngle(this.position.angleTo(other.position))
      .multiply(deltaTime);
    this.velocity = this.velocity.add(acc);
  }

  /** Apply down force. Will be applied automatically if gravity is greater than 0 */
  applyGravity(deltaTime: number): void {
    if (this.isStatic) return;

    this.velocity = this.velocity.add(Vector2.down().multiply(this.gravity * deltaTime));
  }

  /** Apply friction. Will be applied automatically if friction is greater than 0 */
  applyFriction(deltaTime: number): void {
    if (this.isStatic) return;

    const frictionVector = new Vector2(0, this.friction * deltaTime).withAngle(this.velocity.angle);
    if (this.velocity.length > frictionVector.length) {
      this.velocity = this.velocity.subtract(frictionVector);
    } else {
      this.velocity.length = 0;
    }
  }

  /** More optimized friction that looks a bit worse */
  applyPercentageFriction(deltaTime: number): void {
    if (this.isStatic) return;

    this.velocity = this.velocity.multiply(1 - (this.friction / 100) * deltaTime);
  }

  /** Used automatically if bodies have collisionShapes. Changes velocity of 2 bodies based on their current velocity. */
  collideWith(other: PhysicsBody): void {
    const avgSpeed = (this.velocity.length + other.velocity.length) / 2;
    const oldVelocity = this.velocity;

    if (!this.isStatic) {
      this.velocity = this.position
        .withAngle(other.position.angleTo(this.position))
        .add(other.velocity.multiply(2))
        .withLength(this.keepMomentumOnCollision ? this.velocity.length || other.velocity.length : avgSpeed);
    }

    if (!other.isStatic) {
      other.velocity = other.position
        .withAngle(this.position.angleTo(other.position))
        .add(this.velocity.multiply(2))
        .withLength(other.keepMomentumOnCollision ? other.velocity.length || oldVelocity.length : avgSpeed);
    }

    this._onCollision?.(other);
  }

  /** Update position based on velocity. Used automatically if animate on canvas is set to true */
  update(deltaTime: number, _canvas: Canvas): void {
    this.position = this.position.add(this.velocity.multiply(deltaTime));
  }
}
